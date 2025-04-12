
import QtQuick 2.9
import QtQuick.Controls 2.2
import QtQuick.Layouts 1.3
import QtQuick.Window 2.3
import MuseScore 3.0

import "dist/ColorSameNotes/main.js" as Script


MuseScore {
    version: "3.5"
    description: qsTr("Colors notes in the selection that are sharped (red), double-sharped (pink), flatted (blue) or double-flatted (green). ")
    title: "Color Same Notes"
    categoryCode: "color-notes"
    thumbnailName: "_colorSameNotes.png"
    id: mainWindow
    pluginType: "dialog"
    width: 300
    height: 100

    ColumnLayout {
        anchors.centerIn: parent
        spacing: 10

        Button {
            text: "Color Notes"
            onClicked: {
                Script.main()
            }
        }

        Button {
            text: "Reset Color"
            onClicked: {
                Script.main(true)
            }
        }
    }

    // The onRun action for this plugin.
    onRun: {
        console.log("hello AlterColor");
        //applyToNotesInSelection();
    }
}

