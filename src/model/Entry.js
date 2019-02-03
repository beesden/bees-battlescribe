class Catalogue {

    constructor(data) {

        console.log(this);

        this._data = data;

        this.id = data.$.id;
        this.name = data.$.name;

        // Use these for lookups
        this.profiles = {};
        this.entries = {};
        this.groups = {};

        data.sharedProfiles[0].profile.forEach(profile => this.addProfile(profile));
        data.sharedSelectionEntries[0].selectionEntry.forEach(entry => this.addEntry(entry));
        data.sharedSelectionEntryGroups[0].selectionEntryGroup.forEach(group => this.addGroup(group));

        // Categories. Unsure what use these are...
        this.categories = data.categoryEntries[0].categoryEntry.map(category => new Category(this, category)) || [];

        // Available entries
        // TODO - validate that this is the complete list
        // TODO - selectionEntryGroup links (not marines)
        // TODO - inline entries / groups
        this.units = data.entryLinks[0].entryLink.map(entry => new Unit(this, entry))
            .sort((a, b) => a.name > b.name ? 1 : -1);

        console.log(Object.keys(this.profiles).length);
    }

    addProfile(profile) {
        if (this.profiles[profile.$.id]) {
            console.error('Profile already exists!');
            return;
        }
        this.profiles[profile.$.id] = new Profile(this, profile)
    }

    addEntry(entry) {
        this.entries[entry.$.id] = new Entry(this, entry)
    }

    addGroup(group) {
        this.groups[entry.$.id] = new Entry(this, group)
    }

}

class Entry {

    constructor(catalogue, data) {
        this._catalogue = catalogue;
        this._data = data;

        this.id = data.$.id;

        if (data.profiles) {
            data.profiles[0].profile.forEach(profile => catalogue.addProfile(profile));
        }

        if (data.selectionEntries) {
            data.selectionEntries[0].selectionEntry.forEach(entry => catalogue.addEntry(entry));
        }

        if (data.selectionEntryGroups) {
            data.selectionEntryGroups[0].selectionEntryGroup.forEach(group => catalogue.addGroup(group));
        }
    }
}

class Category extends Entry {

    constructor(catalogue, data) {
        super(catalogue, data);

        this.name = data.$.name;
    }

}

class Profile extends Entry {

    constructor(catalogue, data) {

        super(catalogue, data);

        this.name = data.$.name;
        this.type = data.$.profileTypeName;

        if (data.characteristics) {
            this.characteristics = data.characteristics[0].characteristic;
        }

    }

}

class Unit {

    constructor(catalogue, data) {

        this._entry = new Entry(catalogue, data);
        this._target = catalogue.entries[data.$.targetId] || this._entry;

        const unitData = (this._target || this._entry)._data;

        this.name = this._target._data.$.name;
        this._profiles = [];

        // Shared profiles
        if (unitData.infoLinks) {
            unitData.infoLinks[0].infoLink.forEach(link => this._profiles.push(link.$.targetId));
        }

        // Embedded profiles
        if (unitData.profiles) {
            unitData.profiles[0].profile.forEach(profile => this._profiles.push(profile.$.id));
        }

        // Get entries from groups
        if (unitData.selectionEntryGroups) {
            unitData.selectionEntryGroups[0].selectionEntryGroup.forEach(group => {
                catalogue.addGroup(group);

                if (group.profiles) {

                    group.profiles[0].profile.forEach(profile => this._profiles.push(profile.$.id));
                }
            });
        }

    }

    get categories() {
        return this.entry._catalogue.categories.find()
    }

    get profiles() {

        // Fetch profiles on runtime since they may not be all loaded during processing,
        // e.g. profiles loaded from the game file.
        const profiles = this._profiles.map(id => {
            const profile = this._entry._catalogue.profiles[id];
            if (!profile) {
                // todo -   console.error('Profile not found:', id);
            }
            return profile;
        }).filter(profile => !!profile);

        return {
            units: profiles.filter(profile => profile.type === 'Unit'),
            wounds: profiles.filter(profile => profile.type.indexOf('Wound Track') !== -1),
            weapons: profiles.filter(profile => profile.type.indexOf('Weapon') !== -1),
            wargear: profiles.filter(profile => profile.type.indexOf('Wargear Item') !== -1),
        };
    }

}

module.exports = {
    Catalogue
};
