# Copyright (c) 2024 PLANKA Software GmbH
# Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md

import sys
import json
import logging
import apprise


BLOCKED_SCHEMAS_SET = {
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


def send_notification(url, title, body, body_format):
    app = apprise.Apprise()
    app.add(url)
    return app.notify(title=title, body=body, body_format=body_format)


if __name__ == '__main__':
    services = json.loads(sys.argv[1])
    title = sys.argv[2]
    body_by_format = json.loads(sys.argv[3])

    errors = []
    for service in services:
        url = service['url']
        schema = url.split(':')[0]

        if schema in BLOCKED_SCHEMAS_SET:
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
