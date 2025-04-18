
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Window
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
    height: layoutf.height + 20

    property var initialized: false
    property var autoActivated: false
    property var selectedRange: false


    MessageDialog {
        id: errorDialog
        text: "The color of the notes is only updated automatically as long as the plugin window stays open!"
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


        ColumnLayout {
            id: btns
            Layout.alignment: Qt.AlignHCenter
            spacing: 10


            Button {
                id: colorSelection
                text: "Color Selection Once"
                Layout.alignment: Qt.AlignHCenter
                enabled: selectedRange
                onClicked: {
                    updateColorState()

                    Script.state.resetColor = false
                    Script.state.colorSelection()              
                }
            }

            Button {
                id: startBtn
                text: "Start Coloring Notes"
                Layout.alignment: Qt.AlignHCenter
                onClicked: {
                    if (!autoActivated) {
                        Script.state.resetColor = false
                        startTimer()    
                    } else {                        
                        stopTimer()
                    }
                    
                }
            }

            Button {
                text: "Reset Color"
                Layout.alignment: Qt.AlignHCenter
                onClicked: {
                    Script.state.resetColor = true
                    Script.main()
                    stopTimer()
                }
            }
        }


        
    }

    

    Timer {
        id: timerScan
        interval: 200
        repeat: true
        onTriggered: function() {
            Script.state.triggerScan()
        } 
    }

    Timer {
        id: timerColor
        interval: 500
        repeat: true
        onTriggered: function() {
            Script.state.triggerColor()
        }
    }

    Timer {
        id: timerSelection
        interval: 300
        repeat: true
        onTriggered: function() {
            selectedRange = curScore.selection.isRange
        }
    }
    

    function startTimer() {
        startBtn.text = "Stop Coloring Notes"
        autoActivated = true
        Script.main()

        if (initialized) {
            timerScan.start()
            timerColor.start()
            return
        }

        initialized = true
        Script.state.enableAutoUpdate()
        timerScan.start();
        timerColor.start();
    }

    function stopTimer() {
        timerScan.stop()
        timerColor.stop()
        autoActivated = false
        startBtn.text = "Start Coloring Notes"
    }


    function updateColorState() {
        Script.state.updateStateOnly = true
        Script.state.resetColor = false
        Script.main()
        Script.state.updateStateOnly = false

    }

    Component.onCompleted: {
        timerSelection.start()


        mainWindow.Window.visibilityChanged.connect((a) => {
            console.log("visibilityChanged changed", layoutf.Window.visibility)
            if (mainWindow.Window.visibility == 0) {
                if (autoActivated) {
                    errorDialog.visible = true
                }
                console.log("Window closed")
                timerSelection.stop()
                stopTimer()
            }
        })
    }

    Component.onDestruction: {
        console.log("Stop timer")
        timerColor.stop()
        timerScan.stop()
    }


    // The onRun action for this plugin.
    onRun: {
        console.log("hello AlterColor");
        
        //applyToNotesInSelection();
    }
}

