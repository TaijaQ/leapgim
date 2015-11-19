var config = window.config
var view = window.WindowController

var gui = require('nw.gui');

var win = new gui.Window.get();

win.focus();

win.setAlwaysOnTop(true);

/*document.getElementById('creators').innerHTML = gui.App.manifest.author();*/

win.showDevTools();
var devMode = true;


// togglefunction

var menu = new gui.Menu({type: "menubar", label: "Menu"});

var optionsMenu = new gui.Menu();

optionsMenu.append(new gui.MenuItem({ label: 'Toggle OnTop', type: 'checkbox' }));
optionsMenu.append(new gui.MenuItem({ label: 'Button 2' }));

// Append MenuItem as a Submenu
menu.append(
    new gui.MenuItem({
        label: 'Options',
        submenu: optionsMenu // menu elements from optionsMenu object
    })
);

var aboutMenu = new gui.Menu();

aboutMenu.append(new gui.MenuItem({ label: 'Button 1' }));
aboutMenu.append(new gui.MenuItem({ label: 'Button 2' }));


menu.append(
    new gui.MenuItem({
    	label: "About",
    	submenu: aboutMenu
    })
);

menu.append(new gui.MenuItem({label: "                                                                                  "}));

var devButton = new gui.MenuItem({
    label: 'DevMode',
    type: 'checkbox',
    key: 'o',
    modifiers: 'ctrl-alt',
    enabled: true,
    checked: false
})

var xbutton = new gui.MenuItem({
    label: 'X',
    type: 'normal',
    key: 'x',
    modifiers: 'ctrl-alt'
    /*click: function()
        }*/
});

menu.append(devButton);
menu.append(xbutton);


gui.Window.get().menu = menu;

toggleDev(function(checked) {
    if devButton.checked == true {
        devMode = true;
        win.showDevTools();
    }
    else {
        devMode = false;
        win.hideDevTools()
    };
});


/*

input = function(name, type) {
    if (name == 1);
        var xb = document.getElementById('x');
        xb.innerHTML = 'Hey!';
};



xbutton.click = function(result) {
    var result = win.confirm("Are you sure?");
    return result
};

var hidden_xbutton = 

if xbutton.checked == false(){
    hidden_xbutton.value = 'false';

};*/
