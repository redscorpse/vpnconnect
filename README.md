# VPNconnect

This gnome-shell extension inspired by [vpn-toggler](https://github.com/Rheddes/vpn-toggler), which is no longer available on newer versions of gnome-shell.

This is my first time creating an extension so it is under development.

TODO:
- show current public IP on hovering the icon
- add config to ask for the path to the vpn script
- add the extension to the official gnome extensions platform

## Usage
Clone this repo to your default extensions directory, then rename `VPNconnect-example` to `VPNconnect` and edit it setting your own path to the .ovpn config files:
```bash
git clone https://github.com/redscorpse/vpnconnect ~/.local/share/gnome-shell/extensions/vpnconnect@rc.net && \
    mv ~/.local/share/gnome-shell/extensions/vpnconnect@rc.net/VPNconnect-example ~/.local/share/gnome-shell/extensions/vpnconnect@rc.net/VPNconnect && \
    nvim ~/.local/share/gnome-shell/extensions/vpnconnect@rc.net/VPNconnect
```
