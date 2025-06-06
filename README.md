<img src="images/loadmill-macOS-app-icon.png" width="64">

# Loadmill Desktop App
Run and manage your [Loadmill](https://www.loadmill.com) tests locally.

## Releases
Download the latest release [here](https://github.com/loadmill/desktop-app/releases/latest).

## Docs
See the [Loadmill docs](https://docs.loadmill.com/introduction/deviceless-mobile-testing) for more information.

## Loadmill Desktop App – File Storage Locations on macOS

The Loadmill Desktop App uses two different folders under `~/Library/Application Support/`:

### 1. `Loadmill/`

Used by the main Electron desktop app. It contains:

* 🔐 **Proxy Certificate**

  ```
  ~/Library/Application Support/Loadmill/proxy/certs/ca.pem
  ```

* 🪵 **Logs**

  * Agent log:

    ```
    ~/Library/Application Support/Loadmill/agent.log
    ```
  * Proxy errors:

    ```
    ~/Library/Application Support/Loadmill/proxy-errors.log
    ```

### 2. `loadmill-desktop-agent/`

This folder is used by a different process or background service.

It contains Chromium/Electron browser caches, preferences, and storage files:

* `Cache/`, `Code Cache/`, `GPUCache/`, etc.
* `Preferences/`, `Local Storage/`, `Session Storage/`

This folder does **not** contain logs or certificates.

---

### 🧰 Helpful Commands (macOS Terminal)

Find log files:

```bash
find ~/Library/Application\ Support/Loadmill/ -iname "*log*"
```

Tail the main agent log:

```bash
tail -f ~/Library/Application\ Support/Loadmill/agent.log
```
