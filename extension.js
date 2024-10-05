import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
  _init(extension) {
    super._init(0.0, _('My VPN Indicator'));

    // Define paths
    this.path = extension.path;
    this.PATH_SCRIPT = `${this.path}/VPNconnect`;
    this.iconOff = `${this.path}/disconnected.svg`;
    this.iconOn = `${this.path}/connected.svg`;

    log("Loading ON icon from path: " + this.iconOn);
    log("Loading OFF icon from path: " + this.iconOff);

    // Load the initial icon
    this._icon = new St.Icon({
      gicon: Gio.icon_new_for_string(this.iconOff),
      style_class: 'system-status-icon',
      icon_size: 16,
    });
    this.add_child(this._icon);

    // Connect button press event to toggle icons and execute command
    this.connect('button-press-event', () => {
      // log('hasVPN: ', this._hasVPN())
      this._toggleVPN();
    });
  }

  _hasVPN() {
    let [success, stdout, stderr, exitStatus] = GLib.spawn_command_line_sync('ip addr show tun0');
    return exitStatus === 0;
  }

  _toggleVPN() {
    if (this._icon.gicon.to_string() === this.iconOff) {
      this._connect();
    } else {
      this._disconnect();
    }
  }

  // _toggleIcon() {
  //   if (this._icon.gicon.to_string() === this.iconOff) {
  //     this._icon.set_gicon(Gio.icon_new_for_string(this.iconOn));
  //   } else {
  //     this._icon.set_gicon(Gio.icon_new_for_string(this.iconOff));
  //   }
  // }

  _cli(command) {
    return new Promise((resolve, reject) => {
      let proc = Gio.Subprocess.new(
        command.trim().split(' '), 
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
      );
  
      proc.communicate_utf8_async(null, null, (proc, res) => {
        try {
          let [, stdout, stderr] = proc.communicate_utf8_finish(res);
          if (stdout) {
            log("Command output: " + stdout);
            resolve(true);
          }
          if (stderr) {
            logError("Command error: " + stderr);
            resolve(false);
          }
        } catch (e) {
          logError("Error during command execution: " + e);
          reject(e);
        }
      });
    });
  }

  _disconnect() {
    if (this._hasVPN()) {
      let [success, pid] = GLib.spawn_async(
        null, // Working directory
        [this.PATH_SCRIPT, '-k'], // Command and arguments
        null, // Environment variables
        GLib.SpawnFlags.DO_NOT_REAP_CHILD, // Flags
        null // Child setup function
      );
      if (success) {
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, (pid, status) => {
          if (GLib.spawn_check_exit_status(status)) {
            this._icon.set_gicon(Gio.icon_new_for_string(this.iconOff));
          }
          GLib.spawn_close_pid(pid);
        });
      }
    }
  }

  _connect() {
    if (!this._hasVPN()) {
      let [success, pid] = 
        GLib.spawn_async( null, [this.PATH_SCRIPT], null, GLib.SpawnFlags.DO_NOT_REAP_CHILD, null );
      
      if (success) {
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, (pid, status) => {
          if (GLib.spawn_check_exit_status(status)) {
            log('VPN connected successfully');
            this._icon.set_gicon(Gio.icon_new_for_string(this.iconOn));
          }
          GLib.spawn_close_pid(pid);
        });
      } else {
        log('Failed to connect VPN');
      }
    } else {
      log('VPN is already connected');
      if (this._icon.gicon.to_string() === this.iconOff) {
        this._icon.set_gicon(Gio.icon_new_for_string(this.iconOn));
      }
    }
  }
});

export default class IndicatorExampleExtension extends Extension {
  enable() {
    this._indicator = new Indicator(this);
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }
}
