# Copyright (c) 2024 PLANKA Software GmbH
# Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md

import sys
import json
import apprise


def send_notification(url, title, body, body_format):
    app = apprise.Apprise()
    app.add(url)
    app.notify(title=title, body=body, body_format=body_format)


if __name__ == '__main__':
    services = json.loads(sys.argv[1])
    title = sys.argv[2]
    body_by_format = json.loads(sys.argv[3])

    for service in services:
        url = service['url']
        body_format = service['format']
        body = body_by_format[body_format]

        send_notification(url, title, body, body_format)
