/**
 * @typedef {Object} BSData
 *
 * @property {Object} $
 * @property {Array} categoryLinks
 * @property {Array} conditionGroups
 * @property {Array} conditions
 * @property {Array} constraints
 * @property {Array} costs
 * @property {Array} costTypes
 * @property {Array} entryLinks
 * @property {Array} forceEntries
 * @property {Array} infoLinks
 * @property {Array} modifiers
 * @property {Array} profileTypes
 * @property {Array} repeats
 * @property {Array} rules
 * @property {Array} selectionEntries
 * @property {Array} selectionEntryGroups
 */

class DataItem {

    /**
     * Constructor.
     *
     * @param {Catalogue|Unit} root
     * @param {BSData} data
     */
    constructor(root, data) {

        this.id = data.$.id;
        this.name = data.$.name;

        // Simply iterate through simple groups. We don't store any of these
        this.categoryLinks = data.categoryLinks ? data.categoryLinks[0].categoryLink.map(item => new DataItem(root, item)) : [];
        this.conditionGroups = data.conditionGroups ? data.conditionGroups[0].conditionGroup.map(item => new DataItem(root, item)) : [];
        this.conditions = data.conditions ? data.conditions[0].condition.map(item => new DataItem(root, item)) : [];
        this.constraints = data.constraints ? data.constraints[0].constraint.map(item => new DataItem(root, item)) : [];
        this.costs = data.costs ? data.costs[0].cost.map(item => new DataItem(root, item)) : [];
        this.costTypes = data.costTypes ? data.costTypes[0].costType.map(item => new DataItem(root, item)) : [];
        this.entryLinks = data.entryLinks ? data.entryLinks[0].entryLink.map(item => new DataItem(root, item)) : [];
        this.forceEntries = data.forceEntries ? data.forceEntries[0].forceEntry.map(item => new DataItem(root, item)) : [];
        this.infoLinks = data.infoLinks ? data.infoLinks[0].infoLink.map(item => new DataItem(root, item)) : [];
        this.modifiers = data.modifiers ? data.modifiers[0].modifier.map(item => new DataItem(root, item)) : [];
        this.profileTypes = data.profileTypes ? data.profileTypes[0].profileType.map(item => new DataItem(root, item)) : [];
        this.repeats = data.repeats ? data.repeats[0].repeat.map(item => new DataItem(root, item)) : [];
        this.rules = data.rules ? data.rules[0].rule.map(item => new DataItem(root, item)) : [];
        this.selectionEntries = data.selectionEntries ? data.selectionEntries[0].selectionEntry.map(item => new DataItem(root, item)) : [];
        this.selectionEntryGroups = data.selectionEntryGroups ? data.selectionEntryGroups[0].selectionEntryGroup.map(item => new DataItem(root, item)) : [];

        // These are saved against the catalogue
        this.profiles = data.profiles ? data.profiles[0].profile.forEach(profile => root.addProfile(profile)) : [];
    }

}

class Catalogue {

    /**
     * Constructor.
     *
     * @param {BSData} data
     */
    constructor(data) {

        // Iterate through common fields
        this.data = new DataItem(this, data);

        console.log(data);
        console.log(this);

        this.profiles = {};
        this.entries = {};
        this.groups = {};

        // this.categories = data.categoryEntries[0].categoryEntry.map(category => new Category(this, category)) || [];

        this.populate(data.sharedProfiles[0]);
        this.populate(data.sharedSelectionEntries[0]);
        this.populate(data.selectionEntryGroups[0]);
        this.populate(data.sharedSelectionEntryGroups[0]);

        // Available entries
        // TODO - validate that this is the complete list
        // TODO - selectionEntryGroup links (not marines)
        // TODO - inline entries / groups
        // this.units = data.entryLinks[0].entryLink.map(entry => new Unit(this, entry))
        //     .sort((a, b) => a.name > b.name ? 1 : -1);
    }

    /**
     * Constructor.
     *
     * @param {BSData} data
     */
    addProfile(data) {
        const profile = new Profile(data);

        if (this.profiles[profile.id]) {
            console.error('Duplicate profile...', profile.id, profile.name);
        } else {
            this.profiles[profile.id] = profile;
        }
    }

}

class Profile extends DataItem {

    /**
     * Constructor.
     *
     * @param {Catalogue} catalogue
     * @param {BSData} data
     */
    constructor(catalogue, data) {

        super(catalogue, data);

        this.type = data.$.profileTypeName;

        catalogue.addProfile(this);

        if (data.characteristics) {
            this.characteristics = data.characteristics[0].characteristic;
        }

    }

}

class Unit extends DataItem {

    constructor(catalogue, data) {

        super(catalogue,data);

        this.entry = catalogue.entries[data.$.targetId] || this.data;

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

    addProfile(profile) {
        this.profiles.push(profile.$.id);
        this.root.addProfile(profile);
    }

    addEntry(entry) {
        this.root.addEntry(entry);
    }

    addGroup(group) {
        this.root.addGroup(group);
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
