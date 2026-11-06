# Copyright (c) 2024 PLANKA Software GmbH
# Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md

import errno
import os
import sys
import json
import socket
import logging
import ipaddress
import urllib.parse
import apprise


DEFAULT_BLOCKED_SCHEMAS_SET = {
    'syslog',
    'dbus',
    'kde',
    'qt',
    'glib',
    'gnome',
    'macosx',
    'windows',
}


last_apprise_message = None
class CaptureWarningHandler(logging.Handler):
    def emit(self, record):
        global last_apprise_message
        last_apprise_message = record.getMessage()


capture_warning_handler = CaptureWarningHandler()
capture_warning_handler.setLevel(logging.WARNING)

apprise_logger = logging.getLogger('apprise')
apprise_logger.setLevel(logging.WARNING)
apprise_logger.propagate = False
apprise_logger.addHandler(capture_warning_handler)


def to_ip(value):
    try:
        ip = ipaddress.ip_address(value)
    except ValueError:
        return None

    return ip.ipv4_mapped if getattr(ip, 'ipv4_mapped', None) else ip


def resolve_host(host):
    try:
        infos = socket.getaddrinfo(host, None)
    except (OSError, UnicodeError):
        return set()

    return {to_ip(info[4][0].split('%')[0]) for info in infos} - {None}


def split_rules(value):
    return [item.strip() for item in (value or '').split(',') if item.strip()]


def parse_networks(value):
    networks = []
    for item in split_rules(value):
        try:
            network = ipaddress.ip_network(item, strict=False)
        except ValueError:
            continue

        if network.version == 6 and network.network_address.ipv4_mapped:
            network = ipaddress.ip_network(
                (network.network_address.ipv4_mapped, network.prefixlen - 96)
            )

        networks.append(network)

    return networks


def install_outgoing_rules(config, proxy_url):
    """Apply the OUTGOING_* rules (same order as start.sh) to every IP connection."""

    keys = ('blockedIps', 'blockedHosts', 'allowedIps', 'allowedHosts')
    if not any(config.get(key) for key in keys):
        return

    blocked_networks = parse_networks(config.get('blockedIps'))
    allowed_networks = parse_networks(config.get('allowedIps'))

    # Host lists are matched by the addresses they resolve to at start. Names that
    # do not resolve are ignored, and so is Squid's leading dot (subdomain) syntax.
    blocked_ips = {ip for host in split_rules(config.get('blockedHosts')) for ip in resolve_host(host)}
    allowed_ips = {ip for host in split_rules(config.get('allowedHosts')) for ip in resolve_host(host)}

    # Like start.sh, a variable that is set but empty still means "allow nothing"
    has_allowed = config.get('allowedIps') is not None or config.get('allowedHosts') is not None

    # The proxy itself is always reachable
    proxy = urllib.parse.urlparse(proxy_url or '')
    proxy_port = (proxy.port or 3128) if proxy.hostname else None
    proxy_ips = resolve_host(proxy.hostname) if proxy.hostname else set()

    def is_permitted(ip, port):
        if port == proxy_port and ip in proxy_ips:
            return True

        if ip in blocked_ips or any(ip in network for network in blocked_networks):
            return False

        if has_allowed:
            return ip in allowed_ips or any(ip in network for network in allowed_networks)

        return True

    def audit(event, args):
        if event not in ('socket.connect', 'socket.sendto'):
            return

        sock, address = args
        if sock.family not in (socket.AF_INET, socket.AF_INET6):
            return

        host, port = address[0], address[1]
        if isinstance(host, bytes):
            host = host.decode('idna')

        if host == '<broadcast>':
            host = '255.255.255.255'

        ip = to_ip(host.split('%')[0])
        ips = {ip} if ip else resolve_host(host)

        if any(not is_permitted(item, port) for item in ips):
            message = f'Connection to {host} is not permitted by outgoing rules'

            # Apprise only reports a generic failure, so name the reason
            print(message, file=sys.stderr)
            raise ConnectionRefusedError(errno.ECONNREFUSED, message)

    sys.addaudithook(audit)


def send_notification(url, title, body, body_format):
    app = apprise.Apprise()
    app.add(url)
    return app.notify(title=title, body=body, body_format=body_format)


if __name__ == '__main__':
    services = json.loads(sys.argv[1])
    title = sys.argv[2]
    body_by_format = json.loads(sys.argv[3])
    schema_config = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}

    allowed_schemas = set(schema_config.get('allowedSchemas', []))
    custom_blocked = schema_config.get('blockedSchemas', [])
    blocked_schemas = set(custom_blocked) if custom_blocked else DEFAULT_BLOCKED_SCHEMAS_SET

    install_outgoing_rules(
        schema_config.get('outgoingRules', {}),
        os.environ.get('HTTPS_PROXY'),
    )

    errors = []
    for service in services:
        url = service['url']
        schema = url.split(':')[0]

        if allowed_schemas and schema not in allowed_schemas:
            errors.append(f'[{schema}] Schema not in allowed list')
            continue

        if schema in blocked_schemas:
            errors.append(f'[{schema}] Blocked service schema')
            continue

        body_format = service['format']
        body = body_by_format[body_format]

        last_apprise_message = None
        if not send_notification(url, title, body, body_format):
            if last_apprise_message:
                if last_apprise_message == 'There are no service(s) to notify':
                    errors.append(f'[{schema}] Unknown service URL')
                else:
                    errors.append(f'[{schema}] {last_apprise_message}')
            else:
                errors.append(f'[{schema}] Unknown error')

    if errors:
        for error in errors:
            print(error, file=sys.stderr)

        sys.exit(1)
