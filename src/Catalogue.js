function DataModel(data, parent) {
    this.data = data || {};
    this.parent = parent;

    if (!parent) {
        this.profiles = {};
        this.entries = {};
    }

    this.getData();
};

DataModel.prototype = {
    getData: function () {
        var model = this;
        let parent = this.getParent();

        [this.data.selectionEntries, this.data.sharedSelectionEntries].forEach(data => {
            if (data) {
                data.filter(entry => entry.selectionEntry)
                    .forEach(entry => {
                        entry.selectionEntry.forEach(selectionEntry => {
                            let model = new DataModel(selectionEntry, parent);
                            model.getData();
                            parent.entries[selectionEntry.$.id] = selectionEntry;
                        })
                    })
            }
        });

        [this.data.profiles, this.data.sharedProfiles].forEach(data => {
            if (data) {
                data.filter(profile => profile.profile)
                    .forEach(profile => {
                        profile.profile.forEach(profile => {
                            let model = new DataModel(profile, parent);
                            model.getData();
                            parent.profiles[profile.$.id] = profile;
                        })
                    })
            }
        });
    },

    getParent: function () {
        return this.parent || this;
    }
};

module.exports = DataModel;