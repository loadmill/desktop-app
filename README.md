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
  $HOME/Library/Application Support/Loadmill/proxy/certs/ca.pem
  ```

* 🪵 **Logs**

  * Agent log:

    ```
    $HOME/Library/Application Support/Loadmill/agent.log
    ```
  * Proxy errors:

    ```
    $HOME/Library/Application Support/Loadmill/proxy-errors.log
    ```

### 2. `loadmill-desktop-agent/`

This folder is used by a background process or helper component.

It contains Chromium/Electron cache, preferences, and storage:

* `Cache/`, `Code Cache/`, `GPUCache/`
* `Preferences/`, `Local Storage/`, `Session Storage/`

This folder does **not** contain logs or certificates.

---

### 🧰 Helpful Commands (macOS Terminal)

Navigate to the certificate directory:

```bash
cd "$HOME/Library/Application Support/Loadmill/proxy/certs/"
```

Find log files:

```bash
find "$HOME/Library/Application Support/Loadmill/" -iname "*log*"
```

Tail the main agent log:

```bash
tail -f "$HOME/Library/Application Support/Loadmill/agent.log"
```

List all Loadmill-related folders:

```bash
ls "$HOME/Library/Application Support/" | grep -i loadmill
```

> ℹ️ Use double quotes (`"`) to handle paths with spaces, and `$HOME` instead of `~` for better compatibility across environments.
