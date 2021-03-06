var fs = require('fs');
var script_path = __dirname + '/../data/scripts/';

var Library = function(){
    var self = this;

    self.objects = [];

    self.init = function() {
        console.log('[init] loading library..');
        // clear objects
        self.objects = [];
        // load entire library from db
        DB.library.find(function(err, lib){
            if(err) { console.log('ERROR: could not read library database.'); return; }
            lib.forEach(function(libentry){
                self.objects.push(new LibraryEntry(libentry));
            });
        });
    }

    self.createUid = function() {
        var uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
        // check
        while(true) {
            if(self.getByUid(uid)) {
                uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);
            } else {
                break;
            }
        }
        return uid;
    };

    self.getById = function(id) {
        for(var i = 0; i < self.objects.length; i++) {
            if(self.objects[i].id == id)
                return self.objects[i];
        }
        return false;
    };

    self.getByUid = function(uid) {
        for(var i = 0; i < self.objects.length; i++) {
            if(self.objects[i].uid == uid)
                return self.objects[i];
        }
        return false;
    };

    self.save = function() {

    };

    self.createEntry = function(player, entryType, parentString) {
        var uid = LIBRARY.createUid();

        switch(entryType) {
            case 'item':
                var i = ITEMS.getById(parentString)
                if(!i) {
                    player.msg('Could not find item parent.');
                    return;
                }
                DB.library.insert({
                    id: 'item' + parentString + '-' + uid,
                    parent: parentString,
                    type: 'item',
                    overrides: {}
                }, function(err, resp) {
                    if(err) {
                        player.msg('Could not add item to database.');
                        return;
                    } else {
                        self.objects.push(new LibraryEntry(resp));
                    }
                });
                player.msg('Entry added to database: ' + 'item' + parentString + '-' + uid);
                break;
            case 'mob':
                var m = MOBS.getById(parentString)
                if(!m) {
                    player.msg('Could not find mob parent.');
                    return;
                }
                DB.library.insert({
                    id: 'mob' + parentString + '-' + uid,
                    parent: parentString,
                    type: 'mob',
                    overrides: {}
                }, function(err, resp) {
                    if(err) {
                        player.msg('Could not add mob to database.');
                        return;
                    } else {
                        self.objects.push(new LibraryEntry(resp));
                    }
                });
                player.msg('Entry added to database: ' + 'mob' + parentString + '-' + uid);
                break;
        }
    };

    self.listType = function(player, args, type) {
        var objs = [];
        self.objects.forEach(function(lib){
            if(lib.type == type.toLowerCase()) {
                switch(lib.type) {
                    case 'item':
                        objs.push({
                            property: "<span class='itemtooltip libitem' data-id='" + lib.id + "' onclick='GameEngine.parseCommand(\"/spawn " + lib.id + "\")'>" + lib.id + "</span>",
                            value: lib.get('name')
                        });
                        break;
                    default:
                        objs.push({ property: "<span class='libitem' data-id='" + lib.id + "'>" + lib.id + "</span>", value: lib.get('name') });
                }
            }
        });
        player.msg(LOGIC._createTable("Armeria Library: " + type + "s Directory", objs), true);
    };

    self.editEntry = function(player, args) {
        var id = getarg(args, 0, false);
        var prop = getarg(args, 1, false);
        var val = getarg(args, 2, true);
        // get object from library
        var obj = self.getById(id);
        if (obj === false) {
            player.msg('Entry not found in library.');
            return;
        }
        if(prop !== false && val !== false) {
            self.editEntryPropVal(player, obj, prop, val);
            return;
        }
        switch(obj.type) {
            case 'item':
                player.msg(LOGIC._createTable(
                "Item Properties: " + obj.id + " (" + obj.parentText + ")",
                [
                    {
                        property: "Identifier",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"id\")'>" + obj.id + "</a>"
                    },
                    {
                        property: "Name",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"name\")'>" + obj.get('name') + "</a>"
                    },
                    {
                        property: "HTMLName",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"htmlname\")'>" + obj.get('htmlname').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</a>"
                    },
                    {
                        property: "Level",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"level\")'>" + obj.get('level') + "</a>"
                    },
                    {
                        property: "Picture",
                        subtext: "Format: tileset, x, y",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"picture\")'>" + (obj.get('picture') || 'No picture set.') + "</a>"
                    },
                    {
                        property: "Rarity",
                        subtext: "Valid: 0,1,2,3,4",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"rarity\")'>" + (obj.get('rarity') || 'No rarity set.') + "</a>"
                    },
                    {
                        property: "Equip Slot",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"equipslot\")'>" + (obj.get('equipslot') || 'No equip slot set.') + "</a>"
                    },
                    {
                        property: "Weapon Type",
                        subtext: "(If Equip Slot is Weapon)",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"weapontype\")'>" + (obj.get('weapontype') || 'No weapon type set.') + "</a>"
                    },
                    {
                        property: "Script",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"script\")'>" + ((obj.get('script'))?'Script set.':'No script set.') + "</a>"
                    }
                ]));
                break;
            case 'mob':
                player.msg(LOGIC._createTable(
                "Mob Properties: " + obj.id + " (" + obj.parentText + ")",
                [
                    {
                        property: "Identifier",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"id\")'>" + obj.id + "</a>"
                    },
                    {
                        property: "Name",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"name\")'>" + obj.get('name') + "</a>"
                    },
                    {
                        property: "HTMLName",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"htmlname\")'>" + obj.get('htmlname').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</a>"
                    },
                    {
                        property: "Level",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"level\")'>" + obj.get('level') + "</a>"
                    },
                    {
                        property: "Script",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"script\")'>" + ((obj.get('script'))?'Script set.':'No script set.') + "</a>"
                    },
                    {
                        property: "Max Health",
                        value: "<a href='#' onclick='GameEngine.editProperty(\"" + obj.id + "\", \"maxhealth\")'>" + (obj.get('maxhealth') || '100') + "</a>"
                    }
                ]));
                break;
            default:
                player.msg('Cannot edit this type of entry.');
        }
    };

    self.editEntryPropVal = function(player, obj, prop, val){
        switch(obj.type) {
            case 'item':
                obj.set(prop.toLowerCase(), val);
                player.msg('Library entry has been updated.');
                self.editEntry(player, obj.id);
                break;
            case 'mob':
                obj.set(prop.toLowerCase(), val);
                player.msg('Library entry has been updated.');
                self.editEntry(player, obj.id);
                break;
        }
    };

    self.init();
};

var LibraryEntry = function(config) {
    var self = this;

    // basics
    self._id;
    self.id;
    self.parent;
    self.parentText;
    self.type;
    self.overrides;
    self.gameScript = false;
    self.instanceData = {};

    self.init = function(config) {
        self._id = config._id || '';
        self.id = config.id;
        self.uid = LIBRARY.createUid();
        self.type = config.type;
        self.overrides = config.overrides || {};
        self.parentText = config.parent;
        switch(self.type) {
            case 'item':
                self.parent = ITEMS.getById(config.parent);
                break;
            case 'mob':
                self.parent = MOBS.getById(config.parent);
                break;
            default:
                self.parent = config.parent;
        }

        // load a script?
        self.reloadScript();
        console.log('[init] library ' + self.type + ' loaded: ' + self.id + ' (parent: ' + self.parent.id + ')');
        return self;
    };

    self.newInstance = function() {
        return self._id + "-" + LIBRARY.createUid();
    };

    self.reloadScript = function(player) {
        var uid = LIBRARY.createUid();
        if(self.get('script')) {
            // write to temp data folder
            fs.writeFile(script_path + self._id + '.' + uid + '.js', JSON.parse(self.get('script')), function(err) {
                try {
                    self.gameScript = require(script_path + self._id + '.' + uid + '.js').GameScript;
                    self.gameScript = new self.gameScript(self);
                } catch(e) {
                    self.gameScript = false;
                    console.log('[script] error loading: /data/scripts/' + self._id + '.' + uid + '.js');
                    if(player) {
                        player.msg("<span class='red'>ERROR: /data/scripts/" + self._id + "." + uid + ".js</span>");
                        player.msg("<span class='red'>MESSAGE: " + e.message + "</span>");
                    }
                }
            });
        }
    }

    self.get = function(stat, instanceId) {
        if(instanceId)
            if(self.instanceData[instanceId][stat] != undefined)
                return self.instanceData[instanceId][stat];
            else if(self.overrides[stat] != undefined)
                return self.overrides[stat];
            else
                return eval('self.parent.' + stat);
        else {
            if(self.overrides[stat] != undefined)
                return self.overrides[stat];
            else
                return eval('self.parent.' + stat);

        }
    }

    self.set = function(prop, val, instanceId) {
        if(val=='true') { val = true; }
        if(val=='false') { val = false; }

        if(prop == 'id') {
            self.id = val;
            self.save();
            return;
        }

        if(instanceId) {
            if(self.instanceData[instanceId] === undefined) {
                self.instanceData[instanceId] = {};
                self.instanceData[instanceId][prop] = val;
            } else {
                self.instanceData[instanceId][prop] = val;
            }
        } else {
            self.overrides[prop] = val;
            self.save();
        }
    };

    /* ITEM ONLY FUNCTIONS */
    self.ttOutput = function() {
        return "<span class='itemtooltip' data-id='" + self.id + "'>" + self.get('htmlname') + "</span>";
    };
    /* END: ITEM ONLY FUNCTIONS */

    /* SCRIPT FUNCTIONS */
    self.emit = function(func) {
        if(!self.gameScript) return;
        var args = new Array();
        if(arguments.length > 1) {
        	for(var i = 1; i < arguments.length; i++) {
        		args.push(arguments[i]);
        	}
        }
        try {
            if(self.gameScript[func] !== undefined)
                return eval("self.gameScript." + func)(args);
        } catch(err) {
            // error in game script
            if(LIVE) {
                hipchatmsg('<b>Exception caused in library script:</b> ' + self.id, 'red');
                hipchatmsg('<b>When emitting:</b> ' + func, 'red');
                hipchatmsg(err.message, 'red');
            } else {
                console.log('SCRIPT ERROR: ' + self.id + ' (' + func + ')');
                console.log(err.message);
            }
        }
    };
    self.say = function(location, text) {
        var map = WORLD.getMap(location.map);
        if(!map) return;
        var room = map.getRoom(location.x, location.y, location.z);
        if(!room) return;
        room.eachPlayer(function(p){
            p.msg(self.get('htmlname') + " says, '" + text + "'");
            p.emit("sound", {sfx: 'room_msg.wav', volume: 100});
        });
    };
    self.setScriptVar = function(player, stat, data) {
        var _id = self.id + '-' + stat;

        for(var x = 0; x < player.character.scriptvars.length; x++) {
            if(player.character.scriptvars[x].id == _id) {
                player.character.scriptvars[x].data = data;
                return 1;
            }
        }

        player.character.scriptvars.push({
            id: _id,
            data: data
        });

        return 0;
    };
    self.getScriptVar = function(player, stat) {
        var _id = self.id + '-' + stat;

        for(var x = 0; x < player.character.scriptvars.length; x++) {
            if(player.character.scriptvars[x].id == _id) {
                return player.character.scriptvars[x].data;
            }
        }

        return false;
    };
    self.launchSpace = function(player, launchMessage) {
        if(player.character.room.map.inSpace)
            return false;

        // set map to in space
        player.character.room.map.inSpace = true;

        // set everyones space location to your own
        player.character.room.map.eachPlayerExcept(player, function(p){
            p.character.location.sectorx = player.character.location.sectorx;
            p.character.location.sectory = player.character.location.sectory;
            p.character.location.spacex = player.character.location.spacex;
            p.character.location.spacey = player.character.location.spacey;
        });

        // update everyone on this map
        player.character.room.map.eachPlayer(function(p){
            p.update({sector: true});
            p.msg(launchMessage || 'This ship has been launched in to space.');
        });

        return true;
    };
    self.dockFromSpace = function(player, dockMessage) {
        if(!player.character.room.map.inSpace)
            return false;

        // set map to not in space
        player.character.room.map.inSpace = false;

        // update everyone on this map
        player.character.room.map.eachPlayer(function(p){
            p.update({sector: true});
            p.msg(dockMessage || 'This ship has been docked.');
        });

        return true;
    };
    /* END: SCRIPT FUNCTIONS */

    self.save = function() {
        var data = {
            id: self.id,
            type: self.type,
            parent: self.parentText,
            overrides: self.overrides
        };

        DB.library.update({_id: self._id}, data, {upsert: true});
    };

    self.init(config);
};

exports.Library = Library;