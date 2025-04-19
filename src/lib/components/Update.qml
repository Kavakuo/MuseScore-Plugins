import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Dialogs

import MuseScore 3.0
import Muse.UiComponents

import "../utils/update.js" as Update


Item {
    id: updateComponent
    property var lastUpdateCheck: 0
    property var lastRejectedUpdate: 0
    property var updateText: "Update Available!\n\n{{Changelog}}\n\nYou can press F5 when the plugin window is focused to check for updates at any time.\n\nDo you want to download the latest release?"

    Settings {
        property alias lastUpdateCheck: updateComponent.lastUpdateCheck
        property alias lastRejectedUpdate: updateComponent.lastRejectedUpdate
    }

    function checkUpdate() {
        console.log("Check Update")
        Update.main(function(avail, body) {
            lastUpdateCheck = new Date().getTime()
            if (avail) {
                updateAvailable.text = updateText.replace("{{Changelog}}", "Latest Changes:\n" + body)
            }

            updateAvailable.visible = avail
        })
    }

    Shortcut {
        sequence: "F5"
        onActivated: {
            console.log("Check Update")
            checkUpdate()
        }
    }


    MessageDialog {
        id: updateAvailable
        text: ""
        standardButtons: [StandardButton.Ok, StandardButton.Cancel]
        onAccepted: {
            updateAvailable.visible = false
            lastRejectedUpdate = 0
            Qt.openUrlExternally("https://github.com/Kavakuo/MuseScore-Plugins/releases")
        }
        onRejected: {
            updateAvailable.visible = false
            lastRejectedUpdate = new Date().getTime()
        }
    }

    Component.onCompleted: {
        let now = new Date().getTime()
        if (now - lastUpdateCheck > 6*60*60*1000 && now - lastRejectedUpdate > 7*24*60*60*1000) {
            checkUpdate()
        }
        console.log("update loaded", lastUpdateCheck, lastRejectedUpdate)
    }
}