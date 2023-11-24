[![Build Status](https://travis-ci.org/Samourai-Wallet/whirlpool-client-cli.svg?branch=develop)](https://travis-ci.org/Samourai-Wallet/whirlpool-client-cli)
[![](https://jitpack.io/v/Samourai-Wallet/whirlpool-client-cli.svg)](https://jitpack.io/#Samourai-Wallet/whirlpool-client-cli)

# whirlpool-client-gui

Desktop GUI for [Whirlpool](https://code.samourai.io/whirlpool/Whirlpool) by Samourai-Wallet.

## Requirements
- Java 8+ (OpenJDK 8+ recommended)
- A pairing payload obtained from Samourai Wallet (Android)


## Files
Whirlpool files are stored in ```userData``` which varies depending on your OS:
- MacOS: ```~/Library/Application Support/whirlpool-gui```
- Windows: ```%APPDATA%/whirlpool-gui```
- Linux: ```$XDG_CONFIG_HOME/whirlpool-gui``` or ```~/.config/whirlpool-gui```


#### Logs
- logs for GUI: ```whirlpool-gui.log```
- logs for CLI (when local): ```whirlpool-cli.log```

#### Configuration file
- CLI configuration: ```whirlpool-cli-config.properties```
- GUI configuration: ```config.json```

#### System files
- CLI state for wallet: ```whirlpool-cli-state-xxx.properties```
- CLI state for utxos: ```whirlpool-cli-utxos-xxx.properties```

## Gnome + Wayland users
If whirlpool-gui fails to start with error:
```
32290:0303/061855.130963:FATAL:gpu_data_manager_impl_private.cc(986)] The display compositor is frequently crashing. Goodbye.
fish: Job 1, '/opt/whirlpool-gui/whirlpool-gui' terminated by signal SIGTRAP (Trace or breakpoint trap)
```
A workaround is to use ```--no-sandbox``` to launch whirlpool-gui.

## Resources

- [whirlpool](https://code.samourai.io/whirlpool/Whirlpool)
- [whirlpool-protocol](https://code.samourai.io/whirlpool/whirlpool-protocol)
- [whirlpool-client](https://code.samourai.io/whirlpool/whirlpool-client)
- [whirlpool-server](https://code.samourai.io/whirlpool/whirlpool-server)
