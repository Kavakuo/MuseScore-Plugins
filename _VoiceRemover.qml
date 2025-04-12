
import QtQuick 2.9
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
import QtQuick.Dialogs
import MuseScore 3.0

import "dist/VoiceRemover/main.js" as Script


MuseScore {
    version: "3.5"
    description: qsTr("Removes all voices inside a staff, except the selected one.")
    title: "Voice Remover"
    categoryCode: ""
    thumbnailName: "_VoiceRemover.png"
    id: mainWindow
    pluginType: "dialog"
    implicitHeight: layoutf.height + 20
    width: 300

    
    function updateState() {
        try {
            var a = parseInt(mainVoice.text)
            if (a < 1 || a > 4) {
                errorDialog.visible = true
                return false
            }
        } catch(e) {
            errorDialog.visible = true
            return false
        }
        Script.State.alwaysKeepMainVoice = keepMainVoice.checked
        Script.State.mainVoice = parseInt(mainVoice.text) - 1
        return true
    }

    MessageDialog {
        id: errorDialog
        text: "Main Voice must be between 1 and 4!"
        onAccepted: {
            errorDialog.visible = false
        }
    }

    ColumnLayout {
        width: 280
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.margins: 10
        id: layoutf

        RowLayout {
            id: checkboxWithLabel
            spacing: 10
            
            // The checkbox
            CheckBox {
                id: keepMainVoice
                Layout.alignment: Qt.AlignLeft  // This vertically centers the checkbox
                checked: true
                
                // Optional: if you want to remove the default text from the checkbox
                text: ""
                padding: 0
            }

            Item {
                Layout.fillWidth: true
                Layout.preferredHeight: myLabel.implicitHeight

                // The multiline label
                Label {
                    id: myLabel
                    height: implicitHeight
                    text: "Always keep the Main Voice inside a measure if no other voices are present in this measure."
                    
                    anchors.fill: parent       // Allow the label to expand horizontally
                    wrapMode: Text.WordWrap      // Enable automatic line breaking
                    
                    // Optional styling
                    verticalAlignment: Text.AlignVCenter
                }

                MouseArea {
                    id: mouseArea
                    anchors.fill: parent
                    onClicked: {
                        keepMainVoice.checked = !keepMainVoice.checked
                    }
                    // Optional visual feedback
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                }
            }
        }

        RowLayout {
            id: mainVoiceLayout
            spacing: 10

            Label {
                text: "Main Voice"
            }

            Item {
                width: 40
                height: 20

                Rectangle {
                    id: background
                    anchors.fill: parent
                    color: "#ddd"
                    radius: 3
                }

                TextInput {
                    anchors.verticalCenter: background.verticalCenter
                    anchors.left: background.left
                    anchors.leftMargin: 5
                    anchors.right: background.right
                    anchors.rightMargin: 5

                    id: mainVoice
                    text: "1"
                    inputMethodHints: Qt.ImhDigitsOnly
                    validator: IntValidator{bottom: 1; top: 4;}
                    color: "black"
                }
            }
        }

         Label {
            text: "Select the voice you want to keep. This either applies to the full score or only to the selection, if available."
            id: label

            Layout.fillWidth: true
            wrapMode: Text.WordWrap  // This enables automatic line breaking

            height: contentHeight
        }

        ColumnLayout {
            spacing: 10
            id: btns
            Layout.alignment: Qt.AlignHCenter

            Button {
                text: "Voice 1"
                onClicked: {
                    if (updateState()) {
                        Script.State.targetVoice = 0
                        Script.main()
                    }
                }
            }

            Button {
                text: "Voice 2"
                onClicked: {
                    if (updateState()) {
                        Script.State.targetVoice = 1
                        Script.main()
                    }                
                }
            }

            Button {
                text: "Voice 3"
                onClicked: {
                    if (updateState()) {
                        Script.State.targetVoice = 2
                        Script.main()
                    }
                }
            }

            Button {
                text: "Voice 4"
                onClicked: {
                    if (updateState()) {
                        Script.State.targetVoice = 3
                        Script.main()
                    }
                }
            }
            
        }




    }
    

    
    // The onRun action for this plugin.
    onRun: {
        console.log("hello AlterColor");
        //applyToNotesInSelection();
    }
}

