# Remote Support Ticket Tracker & Troubleshooting Guide

A browser-based portfolio project built with HTML, CSS and vanilla JavaScript. It demonstrates a simple workflow for a technical support desk handling CCTV/IP camera, network, VoIP and hardware/power incidents.

## Features

- Dashboard counts for open tickets, high/critical priority tickets, callbacks due and resolved tickets
- Create and edit support tickets with customer, issue, category, priority, status, symptoms, troubleshooting notes, resolution and callback date/time
- Search tickets and filter by status
- Mark tickets resolved or reopen them
- Troubleshooting checklists for camera offline, no recording, one-way audio, internet outage and power faults
- Create a ticket from a troubleshooting guide
- Browser `localStorage` persistence; demo records stay in the current browser
- Responsive layout for desktop and mobile

## Run locally

1. Download or extract the project folder.
2. Open `index.html` in a modern browser.
3. Create a ticket and try the search, status filter, callback field and guide checklists.

No build tools or server are required.

## Suggested demo flow

1. Open Dashboard and explain the four metrics.
2. Create a ticket for “IP camera appears offline”, set priority to High, and record symptoms.
3. Open Troubleshooting Guides and walk through the offline-camera checklist.
4. Search for the ticket, edit its notes, then mark it resolved.
5. Explain when you would escalate a site-wide outage or suspected hardware fault.

## Important limitations

- This is a learning/demo tool, not a production ticketing platform.
- It stores data in browser local storage, so records are not shared across users or computers.
- It has no authentication, backend, real phone integration, email sending, automatic reminders or external device diagnostics.
- Use fictional customer data only.
- The troubleshooting guides are first-line examples. Follow the organisation's approved procedures and security policies in real support work.

## Interview explanation

“I built a browser-based support ticket tracker using HTML, CSS and JavaScript. It lets a support agent log an issue, assign priority and status, document troubleshooting steps, schedule a callback and record the resolution. I also added guided checklists for common CCTV, network and VoIP problems, including escalation criteria. The prototype uses local storage to retain demo tickets in the same browser.”
