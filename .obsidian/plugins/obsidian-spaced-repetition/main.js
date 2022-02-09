'use strict';

var obsidian = require('obsidian');

function forOwn(object, callback) {
    if ((typeof object === 'object') && (typeof callback === 'function')) {
        for (var key in object) {
            if (object.hasOwnProperty(key) === true) {
                if (callback(key, object[key]) === false) {
                    break;
                }
            }
        }
    }
}

var lib = (function () {
    var self = {
        count: 0,
        edges: {},
        nodes: {}
    };

    self.link = function (source, target, weight) {
        if ((isFinite(weight) !== true) || (weight === null)) {
            weight = 1;
        }
        
        weight = parseFloat(weight);

        if (self.nodes.hasOwnProperty(source) !== true) {
            self.count++;
            self.nodes[source] = {
                weight: 0,
                outbound: 0
            };
        }

        self.nodes[source].outbound += weight;

        if (self.nodes.hasOwnProperty(target) !== true) {
            self.count++;
            self.nodes[target] = {
                weight: 0,
                outbound: 0
            };
        }

        if (self.edges.hasOwnProperty(source) !== true) {
            self.edges[source] = {};
        }

        if (self.edges[source].hasOwnProperty(target) !== true) {
            self.edges[source][target] = 0;
        }

        self.edges[source][target] += weight;
    };

    self.rank = function (alpha, epsilon, callback) {
        var delta = 1,
            inverse = 1 / self.count;

        forOwn(self.edges, function (source) {
            if (self.nodes[source].outbound > 0) {
                forOwn(self.edges[source], function (target) {
                    self.edges[source][target] /= self.nodes[source].outbound;
                });
            }
        });

        forOwn(self.nodes, function (key) {
            self.nodes[key].weight = inverse;
        });

        while (delta > epsilon) {
            var leak = 0,
                nodes = {};

            forOwn(self.nodes, function (key, value) {
                nodes[key] = value.weight;

                if (value.outbound === 0) {
                    leak += value.weight;
                }

                self.nodes[key].weight = 0;
            });

            leak *= alpha;

            forOwn(self.nodes, function (source) {
                forOwn(self.edges[source], function (target, weight) {
                    self.nodes[target].weight += alpha * nodes[source] * weight;
                });

                self.nodes[source].weight += (1 - alpha) * inverse + leak * inverse;
            });

            delta = 0;

            forOwn(self.nodes, function (key, value) {
                delta += Math.abs(value.weight - nodes[key]);
            });
        }

        forOwn(self.nodes, function (key) {
            return callback(key, self.nodes[key].weight);
        });
    };

    self.reset = function () {
        self.count = 0;
        self.edges = {};
        self.nodes = {};
    };

    return self;
})();

// https://stackoverflow.com/a/6969486
function escapeRegexString(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// https://stackoverflow.com/questions/38866071/javascript-replace-method-dollar-signs
function fixDollarSigns(text) {
    return text.split("$$").join("$$$");
}
// https://stackoverflow.com/a/52171480
function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
        Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
            Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
        Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
            Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

const DEFAULT_SETTINGS = {
    // flashcards
    flashcardTags: ["#flashcards"],
    convertFoldersToDecks: false,
    cardCommentOnSameLine: false,
    buryRelatedCards: false,
    showContextInCards: true,
    largeScreenMode: false,
    showFileNameInFileLink: false,
    randomizeCardOrder: true,
    disableClozeCards: false,
    disableSinglelineCards: false,
    singlelineCardSeparator: "::",
    disableSinglelineReversedCards: false,
    singlelineReversedCardSeparator: ":::",
    disableMultilineCards: false,
    multilineCardSeparator: "?",
    disableMultilineReversedCards: false,
    multilineReversedCardSeparator: "??",
    // notes
    tagsToReview: ["#review"],
    openRandomNote: false,
    autoNextNote: false,
    disableFileMenuReviewOptions: false,
    maxNDaysNotesReviewQueue: 365,
    // algorithm
    baseEase: 250,
    lapsesIntervalChange: 0.5,
    easyBonus: 1.3,
    maximumInterval: 36525,
    maxLinkFactor: 1.0,
};
function getSetting(settingName, settingsObj) {
    let value = settingsObj[settingName];
    value ??= DEFAULT_SETTINGS[settingName];
    return value;
}
// https://github.com/mgmeyers/obsidian-kanban/blob/main/src/Settings.ts
let applyDebounceTimer = 0;
function applySettingsUpdate(callback) {
    clearTimeout(applyDebounceTimer);
    applyDebounceTimer = window.setTimeout(callback, 512);
}
class SRSettingTab extends obsidian.PluginSettingTab {
    plugin;
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createDiv().innerHTML =
            "<h2>Spaced Repetition Plugin - Settings</h2>";
        containerEl.createDiv().innerHTML =
            'For more information, check the <a href="https://github.com/st3v3nmw/obsidian-spaced-repetition/wiki">wiki</a>.';
        containerEl.createDiv().innerHTML = "<h3>Flashcards</h3>";
        new obsidian.Setting(containerEl)
            .setName("Flashcard tags")
            .setDesc("Enter tags separated by spaces or newlines i.e. #flashcards #deck2 #deck3.")
            .addTextArea((text) => text
            .setValue(`${getSetting("flashcardTags", this.plugin.data.settings).join(" ")}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                this.plugin.data.settings.flashcardTags =
                    value.split(/\s+/);
                await this.plugin.savePluginData();
            });
        }));
        new obsidian.Setting(containerEl)
            .setName("Convert folders to decks and subdecks?")
            .setDesc("This is an alternative to the Flashcard tags option above.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("convertFoldersToDecks", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.convertFoldersToDecks = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Save scheduling comment on the same line as the flashcard's last line?")
            .setDesc("Turning this on will make the HTML comments not break list formatting.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("cardCommentOnSameLine", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.cardCommentOnSameLine = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Bury related cards until the next day?")
            .setDesc("This applies to other cloze deletions in cloze cards.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("buryRelatedCards", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.buryRelatedCards = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Show context in cards?")
            .setDesc("i.e. Title > Heading 1 > Subheading > ... > Subheading")
            .addToggle((toggle) => toggle
            .setValue(getSetting("showContextInCards", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.showContextInCards = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Review cards in large screen mode?")
            .setDesc("[Desktop] Should be useful if you have very large images")
            .addToggle((toggle) => toggle
            .setValue(getSetting("largeScreenMode", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.largeScreenMode = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Show file name instead of 'Open file' in flashcard review?")
            .addToggle((toggle) => toggle
            .setValue(getSetting("showFileNameInFileLink", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.showFileNameInFileLink =
                value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Randomize card order during review?")
            .addToggle((toggle) => toggle
            .setValue(getSetting("randomizeCardOrder", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.randomizeCardOrder = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Disable cloze cards?")
            .setDesc("If you're not currently using 'em & would like the plugin to run a tad faster.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("disableClozeCards", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.disableClozeCards = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Separator for inline flashcards")
            .setDesc("Note that after changing this you have to manually edit any flashcards you already have.")
            .addText((text) => text
            .setValue(`${getSetting("singlelineCardSeparator", this.plugin.data.settings)}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                this.plugin.data.settings.singlelineCardSeparator =
                    value;
                await this.plugin.savePluginData();
                this.plugin.singlelineCardRegex = new RegExp(`^(.+)${escapeRegexString(value)}(.+?)\\n?(?:<!--SR:(.+),(\\d+),(\\d+)-->|$)`, "gm");
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.singlelineCardSeparator =
                    DEFAULT_SETTINGS.singlelineCardSeparator;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Separator for multiline flashcards")
            .setDesc("Note that after changing this you have to manually edit any flashcards you already have.")
            .addText((text) => text
            .setValue(`${getSetting("multilineCardSeparator", this.plugin.data.settings)}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                this.plugin.data.settings.multilineCardSeparator =
                    value;
                await this.plugin.savePluginData();
                this.plugin.multilineCardRegex = new RegExp(`^((?:.+\\n)+)${escapeRegexString(value)}\\n((?:.+?\\n?)+?)(?:<!--SR:(.+),(\\d+),(\\d+)-->|$)`, "gm");
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.multilineCardSeparator =
                    DEFAULT_SETTINGS.multilineCardSeparator;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        containerEl.createDiv().innerHTML = "<h3>Notes</h3>";
        new obsidian.Setting(containerEl)
            .setName("Tags to review")
            .setDesc("Enter tags separated by spaces or newlines i.e. #review #tag2 #tag3.")
            .addTextArea((text) => text
            .setValue(`${getSetting("tagsToReview", this.plugin.data.settings).join(" ")}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                this.plugin.data.settings.tagsToReview =
                    value.split(/\s+/);
                await this.plugin.savePluginData();
            });
        }));
        new obsidian.Setting(containerEl)
            .setName("Open a random note for review")
            .setDesc("When you turn this off, notes are ordered by importance (PageRank).")
            .addToggle((toggle) => toggle
            .setValue(getSetting("openRandomNote", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.openRandomNote = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Open next note automatically after a review")
            .setDesc("For faster reviews.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("autoNextNote", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.autoNextNote = value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Disable review options in the file menu i.e. Review: Easy Good Hard")
            .setDesc("After disabling, you can review using the command hotkeys. Reload Obsidian after changing this.")
            .addToggle((toggle) => toggle
            .setValue(getSetting("disableFileMenuReviewOptions", this.plugin.data.settings))
            .onChange(async (value) => {
            this.plugin.data.settings.disableFileMenuReviewOptions =
                value;
            await this.plugin.savePluginData();
        }));
        new obsidian.Setting(containerEl)
            .setName("Maximum number of days to display on right panel")
            .setDesc("Reduce this for a cleaner interface.")
            .addText((text) => text
            .setValue(`${getSetting("maxNDaysNotesReviewQueue", this.plugin.data.settings)}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                let numValue = Number.parseInt(value);
                if (!isNaN(numValue)) {
                    if (numValue < 1) {
                        new obsidian.Notice("The number of days must be at least 1.");
                        text.setValue(`${this.plugin.data.settings.maxNDaysNotesReviewQueue}`);
                        return;
                    }
                    this.plugin.data.settings.maxNDaysNotesReviewQueue =
                        numValue;
                    await this.plugin.savePluginData();
                }
                else {
                    new obsidian.Notice("Please provide a valid number.");
                }
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.maxNDaysNotesReviewQueue =
                    DEFAULT_SETTINGS.maxNDaysNotesReviewQueue;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        containerEl.createDiv().innerHTML = "<h3>Algorithm</h3>";
        containerEl.createDiv().innerHTML =
            'For more information, check the <a href="https://github.com/st3v3nmw/obsidian-spaced-repetition/wiki/Spaced-Repetition-Algorithm">algorithm implementation</a>.';
        new obsidian.Setting(containerEl)
            .setName("Base ease")
            .setDesc("minimum = 130, preferrably approximately 250.")
            .addText((text) => text
            .setValue(`${getSetting("baseEase", this.plugin.data.settings)}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                let numValue = Number.parseInt(value);
                if (!isNaN(numValue)) {
                    if (numValue < 130) {
                        new obsidian.Notice("The base ease must be at least 130.");
                        text.setValue(`${this.plugin.data.settings.baseEase}`);
                        return;
                    }
                    this.plugin.data.settings.baseEase = numValue;
                    await this.plugin.savePluginData();
                }
                else {
                    new obsidian.Notice("Please provide a valid number.");
                }
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.baseEase =
                    DEFAULT_SETTINGS.baseEase;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Interval change when you review a flashcard/note as hard")
            .setDesc("newInterval = oldInterval * intervalChange / 100.")
            .addSlider((slider) => slider
            .setLimits(1, 99, 1)
            .setValue(getSetting("lapsesIntervalChange", this.plugin.data.settings) * 100)
            .setDynamicTooltip()
            .onChange(async (value) => {
            this.plugin.data.settings.lapsesIntervalChange = value;
            await this.plugin.savePluginData();
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.lapsesIntervalChange =
                    DEFAULT_SETTINGS.lapsesIntervalChange;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Easy bonus")
            .setDesc("The easy bonus allows you to set the difference in intervals between answering Good and Easy on a flashcard/note (minimum = 100%).")
            .addText((text) => text
            .setValue(`${getSetting("easyBonus", this.plugin.data.settings) *
            100}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                let numValue = Number.parseInt(value) / 100;
                if (!isNaN(numValue)) {
                    if (numValue < 1.0) {
                        new obsidian.Notice("The easy bonus must be at least 100.");
                        text.setValue(`${this.plugin.data.settings
                            .easyBonus * 100}`);
                        return;
                    }
                    this.plugin.data.settings.easyBonus = numValue;
                    await this.plugin.savePluginData();
                }
                else {
                    new obsidian.Notice("Please provide a valid number.");
                }
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.easyBonus =
                    DEFAULT_SETTINGS.easyBonus;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Maximum Interval")
            .setDesc("Allows you to place an upper limit on the interval (default = 100 years).")
            .addText((text) => text
            .setValue(`${getSetting("maximumInterval", this.plugin.data.settings)}`)
            .onChange((value) => {
            applySettingsUpdate(async () => {
                let numValue = Number.parseInt(value);
                if (!isNaN(numValue)) {
                    if (numValue < 1) {
                        new obsidian.Notice("The maximum interval must be at least 1 day.");
                        text.setValue(`${this.plugin.data.settings.maximumInterval}`);
                        return;
                    }
                    this.plugin.data.settings.maximumInterval =
                        numValue;
                    await this.plugin.savePluginData();
                }
                else {
                    new obsidian.Notice("Please provide a valid number.");
                }
            });
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.maximumInterval =
                    DEFAULT_SETTINGS.maximumInterval;
                await this.plugin.savePluginData();
                this.display();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Maximum link contribution")
            .setDesc("Maximum contribution of the weighted ease of linked notes to the initial ease.")
            .addSlider((slider) => slider
            .setLimits(0, 100, 1)
            .setValue(getSetting("maxLinkFactor", this.plugin.data.settings) *
            100)
            .setDynamicTooltip()
            .onChange(async (value) => {
            this.plugin.data.settings.maxLinkFactor = value;
            await this.plugin.savePluginData();
        }))
            .addExtraButton((button) => {
            button
                .setIcon("reset")
                .setTooltip("Reset to default")
                .onClick(async () => {
                this.plugin.data.settings.maxLinkFactor =
                    DEFAULT_SETTINGS.maxLinkFactor;
                await this.plugin.savePluginData();
                this.display();
            });
        });
    }
}

var ReviewResponse;
(function (ReviewResponse) {
    ReviewResponse[ReviewResponse["Easy"] = 0] = "Easy";
    ReviewResponse[ReviewResponse["Good"] = 1] = "Good";
    ReviewResponse[ReviewResponse["Hard"] = 2] = "Hard";
    ReviewResponse[ReviewResponse["Reset"] = 3] = "Reset";
})(ReviewResponse || (ReviewResponse = {}));
// Decks
class Deck {
    deckName;
    newFlashcards;
    newFlashcardsCount = 0; // counts those in subdecks too
    dueFlashcards;
    dueFlashcardsCount = 0; // counts those in subdecks too
    totalFlashcards = 0; // counts those in subdecks too
    subdecks;
    parent;
    constructor(deckName, parent) {
        this.deckName = deckName;
        this.newFlashcards = [];
        this.newFlashcardsCount = 0;
        this.dueFlashcards = [];
        this.dueFlashcardsCount = 0;
        this.totalFlashcards = 0;
        this.subdecks = [];
        this.parent = parent;
    }
    createDeck(deckPath) {
        if (deckPath.length == 0)
            return;
        let deckName = deckPath.shift();
        for (let deck of this.subdecks) {
            if (deckName == deck.deckName) {
                deck.createDeck(deckPath);
                return;
            }
        }
        let deck = new Deck(deckName, this);
        this.subdecks.push(deck);
        deck.createDeck(deckPath);
    }
    insertFlashcard(deckPath, cardObj) {
        if (cardObj.isDue)
            this.dueFlashcardsCount++;
        else
            this.newFlashcardsCount++;
        this.totalFlashcards++;
        if (deckPath.length == 0) {
            if (cardObj.isDue)
                this.dueFlashcards.push(cardObj);
            else
                this.newFlashcards.push(cardObj);
            return;
        }
        let deckName = deckPath.shift();
        for (let deck of this.subdecks) {
            if (deckName == deck.deckName) {
                deck.insertFlashcard(deckPath, cardObj);
                return;
            }
        }
    }
    // count flashcards that have either been buried
    // or aren't due yet
    countFlashcard(deckPath) {
        this.totalFlashcards++;
        let deckName = deckPath.shift();
        for (let deck of this.subdecks) {
            if (deckName == deck.deckName) {
                deck.countFlashcard(deckPath);
                return;
            }
        }
    }
    deleteFlashcardAtIndex(index, cardIsDue) {
        if (cardIsDue)
            this.dueFlashcards.splice(index, 1);
        else
            this.newFlashcards.splice(index, 1);
        let deck = this;
        while (deck != null) {
            if (cardIsDue)
                deck.dueFlashcardsCount--;
            else
                deck.newFlashcardsCount--;
            deck = deck.parent;
        }
    }
    sortSubdecksList() {
        this.subdecks.sort((a, b) => {
            if (a.deckName < b.deckName)
                return -1;
            else if (a.deckName > b.deckName)
                return 1;
            return 0;
        });
        for (let deck of this.subdecks)
            deck.sortSubdecksList();
    }
    // implemented in flashcard-model.ts
    render(containerEl, modal) { }
    nextCard(modal) { }
}
// Flashcards
var CardType;
(function (CardType) {
    CardType[CardType["SingleLineBasic"] = 0] = "SingleLineBasic";
    CardType[CardType["MultiLineBasic"] = 1] = "MultiLineBasic";
    CardType[CardType["Cloze"] = 2] = "Cloze";
})(CardType || (CardType = {}));
var FlashcardModalMode;
(function (FlashcardModalMode) {
    FlashcardModalMode[FlashcardModalMode["DecksList"] = 0] = "DecksList";
    FlashcardModalMode[FlashcardModalMode["Front"] = 1] = "Front";
    FlashcardModalMode[FlashcardModalMode["Back"] = 2] = "Back";
    FlashcardModalMode[FlashcardModalMode["Closed"] = 3] = "Closed";
})(FlashcardModalMode || (FlashcardModalMode = {}));

function schedule(response, interval, ease, delayBeforeReview, settingsObj, dueDates) {
    let lapsesIntervalChange = getSetting("lapsesIntervalChange", settingsObj);
    let easyBonus = getSetting("easyBonus", settingsObj);
    let maximumInterval = getSetting("maximumInterval", settingsObj);
    delayBeforeReview = Math.max(0, Math.floor(delayBeforeReview / (24 * 3600 * 1000)));
    if (response == ReviewResponse.Easy) {
        ease += 20;
        interval = ((interval + delayBeforeReview) * ease) / 100;
        interval *= easyBonus;
    }
    else if (response == ReviewResponse.Good) {
        interval = ((interval + delayBeforeReview / 2) * ease) / 100;
    }
    else if (response == ReviewResponse.Hard) {
        ease = Math.max(130, ease - 20);
        interval = Math.max(1, (interval + delayBeforeReview / 4) * lapsesIntervalChange);
    }
    // replaces random fuzz with load balancing over the fuzz interval
    if (dueDates != null) {
        interval = Math.round(interval);
        if (!dueDates.hasOwnProperty(interval))
            dueDates[interval] = 0;
        let fuzzRange;
        if (interval < 2)
            fuzzRange = [1, 1];
        else if (interval == 2)
            fuzzRange = [2, 3];
        else {
            let fuzz;
            if (interval < 7)
                fuzz = 1;
            else if (interval < 30)
                fuzz = Math.max(2, Math.floor(interval * 0.15));
            else
                fuzz = Math.max(4, Math.floor(interval * 0.05));
            fuzzRange = [interval - fuzz, interval + fuzz];
        }
        for (let ivl = fuzzRange[0]; ivl <= fuzzRange[1]; ivl++) {
            if (!dueDates.hasOwnProperty(ivl))
                dueDates[ivl] = 0;
            if (dueDates[ivl] < dueDates[interval])
                interval = ivl;
        }
        dueDates[interval]++;
    }
    interval = Math.min(interval, maximumInterval);
    return { interval: Math.round(interval * 10) / 10, ease };
}
function textInterval(interval, isMobile) {
    let m = Math.round(interval / 3) / 10;
    let y = Math.round(interval / 36.5) / 10;
    if (isMobile) {
        if (interval < 30)
            return `${interval}d`;
        else if (interval < 365)
            return `${m}m`;
        else
            return `${y}y`;
    }
    else {
        if (interval < 30)
            return interval == 1.0 ? "1.0 day" : `${interval} days`;
        else if (interval < 365)
            return m == 1.0 ? "1.0 month" : `${m} months`;
        else
            return y == 1.0 ? "1.0 year" : `${y} years`;
    }
}

const SCHEDULING_INFO_REGEX = /^---\n((?:.*\n)*)sr-due: (.+)\nsr-interval: (\d+)\nsr-ease: (\d+)\n((?:.*\n)*)---/;
const YAML_FRONT_MATTER_REGEX = /^---\n((?:.*\n)*?)---/;
const CLOZE_CARD_DETECTOR = /(?:.+\n)*^.*?==.*?==.*\n(?:.+\n?)*/gm; // card must have at least one cloze
const CLOZE_DELETIONS_EXTRACTOR = /==(.*?)==/gm;
const CLOZE_SCHEDULING_EXTRACTOR = /!([\d-]+),(\d+),(\d+)/gm;
const CODEBLOCK_REGEX = /```(?:.*\n)*?```/gm;
const INLINE_CODE_REGEX = /`(?!`).+`/gm;
const CROSS_HAIRS_ICON = `<path style=" stroke:none;fill-rule:nonzero;fill:currentColor;fill-opacity:1;" d="M 99.921875 47.941406 L 93.074219 47.941406 C 92.84375 42.03125 91.390625 36.238281 88.800781 30.921875 L 85.367188 32.582031 C 87.667969 37.355469 88.964844 42.550781 89.183594 47.84375 L 82.238281 47.84375 C 82.097656 44.617188 81.589844 41.417969 80.734375 38.304688 L 77.050781 39.335938 C 77.808594 42.089844 78.261719 44.917969 78.40625 47.769531 L 65.871094 47.769531 C 64.914062 40.507812 59.144531 34.832031 51.871094 33.996094 L 51.871094 21.386719 C 54.816406 21.507812 57.742188 21.960938 60.585938 22.738281 L 61.617188 19.058594 C 58.4375 18.191406 55.164062 17.691406 51.871094 17.570312 L 51.871094 10.550781 C 57.164062 10.769531 62.355469 12.066406 67.132812 14.363281 L 68.789062 10.929688 C 63.5 8.382812 57.738281 6.953125 51.871094 6.734375 L 51.871094 0.0390625 L 48.054688 0.0390625 L 48.054688 6.734375 C 42.179688 6.976562 36.417969 8.433594 31.132812 11.007812 L 32.792969 14.441406 C 37.566406 12.140625 42.761719 10.84375 48.054688 10.625 L 48.054688 17.570312 C 44.828125 17.714844 41.628906 18.21875 38.515625 19.078125 L 39.546875 22.757812 C 42.324219 21.988281 45.175781 21.53125 48.054688 21.386719 L 48.054688 34.03125 C 40.796875 34.949219 35.089844 40.679688 34.203125 47.941406 L 21.5 47.941406 C 21.632812 45.042969 22.089844 42.171875 22.855469 39.375 L 19.171875 38.34375 C 18.3125 41.457031 17.808594 44.65625 17.664062 47.882812 L 10.664062 47.882812 C 10.882812 42.589844 12.179688 37.394531 14.480469 32.621094 L 11.121094 30.921875 C 8.535156 36.238281 7.078125 42.03125 6.847656 47.941406 L 0 47.941406 L 0 51.753906 L 6.847656 51.753906 C 7.089844 57.636719 8.542969 63.402344 11.121094 68.695312 L 14.554688 67.035156 C 12.257812 62.261719 10.957031 57.066406 10.738281 51.773438 L 17.742188 51.773438 C 17.855469 55.042969 18.34375 58.289062 19.191406 61.445312 L 22.871094 60.414062 C 22.089844 57.5625 21.628906 54.632812 21.5 51.679688 L 34.203125 51.679688 C 35.058594 58.96875 40.773438 64.738281 48.054688 65.660156 L 48.054688 78.308594 C 45.105469 78.1875 42.183594 77.730469 39.335938 76.957031 L 38.304688 80.636719 C 41.488281 81.511719 44.757812 82.015625 48.054688 82.144531 L 48.054688 89.144531 C 42.761719 88.925781 37.566406 87.628906 32.792969 85.328125 L 31.132812 88.765625 C 36.425781 91.3125 42.183594 92.742188 48.054688 92.960938 L 48.054688 99.960938 L 51.871094 99.960938 L 51.871094 92.960938 C 57.75 92.71875 63.519531 91.265625 68.808594 88.6875 L 67.132812 85.253906 C 62.355469 87.550781 57.164062 88.851562 51.871094 89.070312 L 51.871094 82.125 C 55.09375 81.980469 58.292969 81.476562 61.40625 80.617188 L 60.378906 76.9375 C 57.574219 77.703125 54.695312 78.15625 51.792969 78.289062 L 51.792969 65.679688 C 59.121094 64.828125 64.910156 59.0625 65.796875 51.734375 L 78.367188 51.734375 C 78.25 54.734375 77.789062 57.710938 76.992188 60.605469 L 80.675781 61.636719 C 81.558594 58.40625 82.066406 55.082031 82.183594 51.734375 L 89.261719 51.734375 C 89.042969 57.03125 87.742188 62.222656 85.445312 66.996094 L 88.878906 68.65625 C 91.457031 63.367188 92.910156 57.597656 93.152344 51.71875 L 100 51.71875 Z M 62.019531 51.734375 C 61.183594 56.945312 57.085938 61.023438 51.871094 61.828125 L 51.871094 57.515625 L 48.054688 57.515625 L 48.054688 61.808594 C 42.910156 60.949219 38.886719 56.902344 38.058594 51.753906 L 42.332031 51.753906 L 42.332031 47.941406 L 38.058594 47.941406 C 38.886719 42.789062 42.910156 38.746094 48.054688 37.886719 L 48.054688 42.179688 L 51.871094 42.179688 L 51.871094 37.847656 C 57.078125 38.648438 61.179688 42.71875 62.019531 47.921875 L 57.707031 47.921875 L 57.707031 51.734375 Z M 62.019531 51.734375 "/>`;
const COLLAPSE_ICON = `<svg viewBox="0 0 100 100" width="8" height="8" class="right-triangle"><path fill="currentColor" stroke="currentColor" d="M94.9,20.8c-1.4-2.5-4.1-4.1-7.1-4.1H12.2c-3,0-5.7,1.6-7.1,4.1c-1.3,2.4-1.2,5.2,0.2,7.6L43.1,88c1.5,2.3,4,3.7,6.9,3.7 s5.4-1.4,6.9-3.7l37.8-59.6C96.1,26,96.2,23.2,94.9,20.8L94.9,20.8z"></path></svg>`;

class FlashcardModal extends obsidian.Modal {
    plugin;
    answerBtn;
    flashcardView;
    hardBtn;
    goodBtn;
    easyBtn;
    responseDiv;
    fileLinkView;
    resetLinkView;
    contextView;
    currentCard;
    currentCardIdx;
    currentDeck;
    checkDeck;
    mode;
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.titleEl.setText("Decks");
        if (obsidian.Platform.isMobile) {
            this.modalEl.style.height = "100%";
            this.modalEl.style.width = "100%";
            this.contentEl.style.display = "block";
        }
        else {
            if (getSetting("largeScreenMode", this.plugin.data.settings)) {
                this.modalEl.style.height = "100%";
                this.modalEl.style.width = "100%";
            }
            else {
                this.modalEl.style.height = "80%";
                this.modalEl.style.width = "40%";
            }
        }
        this.contentEl.style.position = "relative";
        this.contentEl.style.height = "92%";
        this.contentEl.addClass("sr-modal-content");
        document.body.onkeypress = (e) => {
            if (this.mode != FlashcardModalMode.DecksList) {
                if (this.mode != FlashcardModalMode.Closed &&
                    e.code == "KeyS") {
                    this.currentDeck.deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue);
                    if (this.currentCard.cardType == CardType.Cloze)
                        this.buryRelatedCards(false);
                    this.currentDeck.nextCard(this);
                }
                else if (this.mode == FlashcardModalMode.Front &&
                    (e.code == "Space" || e.code == "Enter"))
                    this.showAnswer();
                else if (this.mode == FlashcardModalMode.Back) {
                    if (e.code == "Numpad1" || e.code == "Digit1")
                        this.processReview(ReviewResponse.Hard);
                    else if (e.code == "Numpad2" ||
                        e.code == "Digit2" ||
                        e.code == "Space")
                        this.processReview(ReviewResponse.Good);
                    else if (e.code == "Numpad3" || e.code == "Digit3")
                        this.processReview(ReviewResponse.Easy);
                    else if (e.code == "Numpad0" || e.code == "Digit0")
                        this.processReview(ReviewResponse.Reset);
                }
            }
        };
    }
    onOpen() {
        this.decksList();
    }
    onClose() {
        this.mode = FlashcardModalMode.Closed;
    }
    decksList() {
        this.mode = FlashcardModalMode.DecksList;
        this.titleEl.setText("Decks");
        this.titleEl.innerHTML +=
            '<p style="margin:0px;line-height:12px;">' +
                '<span style="background-color:#4caf50;color:#ffffff;" aria-label="Due cards" class="tag-pane-tag-count tree-item-flair">' +
                this.plugin.deckTree.dueFlashcardsCount +
                "</span>" +
                '<span style="background-color:#2196f3;" aria-label="New cards" class="tag-pane-tag-count tree-item-flair sr-deck-counts">' +
                this.plugin.deckTree.newFlashcardsCount +
                "</span>" +
                '<span style="background-color:#ff7043;" aria-label="Total cards" class="tag-pane-tag-count tree-item-flair sr-deck-counts">' +
                this.plugin.deckTree.totalFlashcards +
                "</span>" +
                "</p>";
        this.contentEl.innerHTML = "";
        this.contentEl.setAttribute("id", "sr-flashcard-view");
        for (let deck of this.plugin.deckTree.subdecks)
            deck.render(this.contentEl, this);
    }
    setupCardsView() {
        this.contentEl.innerHTML = "";
        this.fileLinkView = this.contentEl.createDiv("sr-link");
        this.fileLinkView.setText("Open file");
        if (getSetting("showFileNameInFileLink", this.plugin.data.settings))
            this.fileLinkView.setAttribute("aria-label", "Open file");
        this.fileLinkView.addEventListener("click", (_) => {
            this.close();
            this.plugin.app.workspace.activeLeaf.openFile(this.currentCard.note);
        });
        this.resetLinkView = this.contentEl.createDiv("sr-link");
        this.resetLinkView.setText("Reset card's progress");
        this.resetLinkView.addEventListener("click", (_) => {
            this.processReview(ReviewResponse.Reset);
        });
        this.resetLinkView.style.float = "right";
        if (getSetting("showContextInCards", this.plugin.data.settings)) {
            this.contextView = this.contentEl.createDiv();
            this.contextView.setAttribute("id", "sr-context");
        }
        this.flashcardView = this.contentEl.createDiv("div");
        this.flashcardView.setAttribute("id", "sr-flashcard-view");
        this.responseDiv = this.contentEl.createDiv("sr-response");
        this.hardBtn = document.createElement("button");
        this.hardBtn.setAttribute("id", "sr-hard-btn");
        this.hardBtn.setText("Hard");
        this.hardBtn.addEventListener("click", (_) => {
            this.processReview(ReviewResponse.Hard);
        });
        this.responseDiv.appendChild(this.hardBtn);
        this.goodBtn = document.createElement("button");
        this.goodBtn.setAttribute("id", "sr-good-btn");
        this.goodBtn.setText("Good");
        this.goodBtn.addEventListener("click", (_) => {
            this.processReview(ReviewResponse.Good);
        });
        this.responseDiv.appendChild(this.goodBtn);
        this.easyBtn = document.createElement("button");
        this.easyBtn.setAttribute("id", "sr-easy-btn");
        this.easyBtn.setText("Easy");
        this.easyBtn.addEventListener("click", (_) => {
            this.processReview(ReviewResponse.Easy);
        });
        this.responseDiv.appendChild(this.easyBtn);
        this.responseDiv.style.display = "none";
        this.answerBtn = this.contentEl.createDiv();
        this.answerBtn.setAttribute("id", "sr-show-answer");
        this.answerBtn.setText("Show Answer");
        this.answerBtn.addEventListener("click", (_) => {
            this.showAnswer();
        });
    }
    showAnswer() {
        this.mode = FlashcardModalMode.Back;
        this.answerBtn.style.display = "none";
        this.responseDiv.style.display = "grid";
        if (this.currentCard.isDue)
            this.resetLinkView.style.display = "inline-block";
        if (this.currentCard.cardType != CardType.Cloze) {
            let hr = document.createElement("hr");
            hr.setAttribute("id", "sr-hr-card-divide");
            this.flashcardView.appendChild(hr);
        }
        else
            this.flashcardView.innerHTML = "";
        this.renderMarkdownWrapper(this.currentCard.back, this.flashcardView);
    }
    async processReview(response) {
        let interval, ease, due;
        this.currentDeck.deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue);
        if (response != ReviewResponse.Reset) {
            // scheduled card
            if (this.currentCard.isDue) {
                let schedObj = schedule(response, this.currentCard.interval, this.currentCard.ease, this.currentCard.delayBeforeReview, this.plugin.data.settings, this.plugin.dueDatesFlashcards);
                interval = schedObj.interval;
                ease = schedObj.ease;
            }
            else {
                let schedObj = schedule(response, 1, getSetting("baseEase", this.plugin.data.settings), 0, this.plugin.data.settings, this.plugin.dueDatesFlashcards);
                interval = schedObj.interval;
                ease = schedObj.ease;
            }
            due = window.moment(Date.now() + interval * 24 * 3600 * 1000);
        }
        else {
            this.currentCard.interval = 1.0;
            this.currentCard.ease = this.plugin.data.settings.baseEase;
            if (this.currentCard.isDue)
                this.currentDeck.dueFlashcards.push(this.currentCard);
            else
                this.currentDeck.newFlashcards.push(this.currentCard);
            due = window.moment(Date.now());
            new obsidian.Notice("Card's progress has been reset");
            this.currentDeck.nextCard(this);
            return;
        }
        let dueString = due.format("YYYY-MM-DD");
        let fileText = await this.app.vault.read(this.currentCard.note);
        let replacementRegex = new RegExp(escapeRegexString(this.currentCard.cardText), "gm");
        let sep = getSetting("cardCommentOnSameLine", this.plugin.data.settings)
            ? " "
            : "\n";
        if (this.currentCard.cardType == CardType.Cloze) {
            let schedIdx = this.currentCard.cardText.lastIndexOf("<!--SR:");
            if (schedIdx == -1) {
                // first time adding scheduling information to flashcard
                this.currentCard.cardText = `${this.currentCard.cardText}${sep}<!--SR:!${dueString},${interval},${ease}-->`;
            }
            else {
                let scheduling = [
                    ...this.currentCard.cardText.matchAll(CLOZE_SCHEDULING_EXTRACTOR),
                ];
                let deletionSched = [
                    "0",
                    dueString,
                    `${interval}`,
                    `${ease}`,
                ];
                if (this.currentCard.isDue)
                    scheduling[this.currentCard.subCardIdx] = deletionSched;
                else
                    scheduling.push(deletionSched);
                this.currentCard.cardText = this.currentCard.cardText.replace(/<!--SR:.+-->/gm, "");
                this.currentCard.cardText += "<!--SR:";
                for (let i = 0; i < scheduling.length; i++)
                    this.currentCard.cardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
                this.currentCard.cardText += "-->";
            }
            fileText = fileText.replace(replacementRegex, fixDollarSigns(this.currentCard.cardText));
            for (let relatedCard of this.currentCard.relatedCards)
                relatedCard.cardText = this.currentCard.cardText;
            if (this.plugin.data.settings.buryRelatedCards)
                this.buryRelatedCards(true);
        }
        else {
            if (this.currentCard.cardType == CardType.SingleLineBasic) {
                fileText = fileText.replace(replacementRegex, `${fixDollarSigns(this.currentCard.front)}${getSetting("singlelineCardSeparator", this.plugin.data.settings)}${fixDollarSigns(this.currentCard.back)}${sep}<!--SR:${dueString},${interval},${ease}-->`);
            }
            else {
                fileText = fileText.replace(replacementRegex, `${fixDollarSigns(this.currentCard.front)}\n${getSetting("multilineCardSeparator", this.plugin.data.settings)}\n${fixDollarSigns(this.currentCard.back)}${sep}<!--SR:${dueString},${interval},${ease}-->`);
            }
        }
        await this.app.vault.modify(this.currentCard.note, fileText);
        this.currentDeck.nextCard(this);
    }
    async buryRelatedCards(tillNextDay) {
        if (tillNextDay) {
            this.plugin.data.buryList.push(cyrb53(this.currentCard.cardText));
            await this.plugin.savePluginData();
        }
        for (let relatedCard of this.currentCard.relatedCards) {
            let dueIdx = this.currentDeck.dueFlashcards.indexOf(relatedCard);
            let newIdx = this.currentDeck.newFlashcards.indexOf(relatedCard);
            if (dueIdx != -1)
                this.currentDeck.deleteFlashcardAtIndex(dueIdx, this.currentDeck.dueFlashcards[dueIdx].isDue);
            else if (newIdx != -1)
                this.currentDeck.deleteFlashcardAtIndex(newIdx, this.currentDeck.newFlashcards[newIdx].isDue);
        }
    }
    // slightly modified version of the renderMarkdown function in
    // https://github.com/mgmeyers/obsidian-kanban/blob/main/src/KanbanView.tsx
    async renderMarkdownWrapper(markdownString, containerEl) {
        obsidian.MarkdownRenderer.renderMarkdown(markdownString, containerEl, this.currentCard.note.path, null);
        containerEl.findAll(".internal-embed").forEach((el) => {
            const src = el.getAttribute("src");
            const target = typeof src === "string" &&
                this.plugin.app.metadataCache.getFirstLinkpathDest(src, this.currentCard.note.path);
            if (target instanceof obsidian.TFile && target.extension !== "md") {
                el.innerText = "";
                el.createEl("img", {
                    attr: {
                        src: this.plugin.app.vault.getResourcePath(target),
                    },
                }, (img) => {
                    if (el.hasAttribute("width"))
                        img.setAttribute("width", el.getAttribute("width"));
                    else
                        img.setAttribute("width", "100%");
                    if (el.hasAttribute("alt"))
                        img.setAttribute("alt", el.getAttribute("alt"));
                });
                el.addClasses(["image-embed", "is-loaded"]);
            }
            // file does not exist
            // display dead link
            if (target == null)
                el.innerText = src;
        });
    }
}
Deck.prototype.render = function (containerEl, modal) {
    let deckView = containerEl.createDiv("tree-item");
    let deckViewSelf = deckView.createDiv("tree-item-self tag-pane-tag is-clickable");
    let collapsed = true;
    let collapseIconEl = deckViewSelf.createDiv("tree-item-icon collapse-icon");
    collapseIconEl.innerHTML = COLLAPSE_ICON;
    collapseIconEl.childNodes[0].style.transform =
        "rotate(-90deg)";
    let deckViewInner = deckViewSelf.createDiv("tree-item-inner");
    deckViewInner.addEventListener("click", (_) => {
        modal.currentDeck = this;
        modal.checkDeck = this.parent;
        modal.setupCardsView();
        this.nextCard(modal);
    });
    let deckViewInnerText = deckViewInner.createDiv("tag-pane-tag-text");
    deckViewInnerText.innerHTML += `<span class="tag-pane-tag-self">${this.deckName}</span>`;
    let deckViewOuter = deckViewSelf.createDiv("tree-item-flair-outer");
    deckViewOuter.innerHTML +=
        '<span style="background-color:#4caf50;" class="tag-pane-tag-count tree-item-flair sr-deck-counts">' +
            this.dueFlashcardsCount +
            "</span>" +
            '<span style="background-color:#2196f3;" class="tag-pane-tag-count tree-item-flair sr-deck-counts">' +
            this.newFlashcardsCount +
            "</span>" +
            '<span style="background-color:#ff7043;" class="tag-pane-tag-count tree-item-flair sr-deck-counts">' +
            this.totalFlashcards +
            "</span>";
    let deckViewChildren = deckView.createDiv("tree-item-children");
    deckViewChildren.style.display = "none";
    collapseIconEl.addEventListener("click", (_) => {
        if (collapsed) {
            collapseIconEl.childNodes[0].style.transform = "";
            deckViewChildren.style.display = "block";
        }
        else {
            collapseIconEl.childNodes[0].style.transform =
                "rotate(-90deg)";
            deckViewChildren.style.display = "none";
        }
        collapsed = !collapsed;
    });
    for (let deck of this.subdecks)
        deck.render(deckViewChildren, modal);
};
Deck.prototype.nextCard = function (modal) {
    if (this.newFlashcards.length + this.dueFlashcards.length == 0) {
        if (this.dueFlashcardsCount + this.newFlashcardsCount > 0) {
            for (let deck of this.subdecks) {
                if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0) {
                    modal.currentDeck = deck;
                    deck.nextCard(modal);
                    return;
                }
            }
        }
        if (this.parent == modal.checkDeck)
            modal.decksList();
        else
            this.parent.nextCard(modal);
        return;
    }
    modal.responseDiv.style.display = "none";
    modal.resetLinkView.style.display = "none";
    modal.titleEl.setText(`${this.deckName} - ${this.dueFlashcardsCount + this.newFlashcardsCount}`);
    modal.answerBtn.style.display = "initial";
    modal.flashcardView.innerHTML = "";
    modal.mode = FlashcardModalMode.Front;
    if (this.dueFlashcards.length > 0) {
        if (getSetting("randomizeCardOrder", modal.plugin.data.settings))
            modal.currentCardIdx = Math.floor(Math.random() * this.dueFlashcards.length);
        else
            modal.currentCardIdx = 0;
        modal.currentCard = this.dueFlashcards[modal.currentCardIdx];
        modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);
        let hardInterval = schedule(ReviewResponse.Hard, modal.currentCard.interval, modal.currentCard.ease, modal.currentCard.delayBeforeReview, modal.plugin.data.settings).interval;
        let goodInterval = schedule(ReviewResponse.Good, modal.currentCard.interval, modal.currentCard.ease, modal.currentCard.delayBeforeReview, modal.plugin.data.settings).interval;
        let easyInterval = schedule(ReviewResponse.Easy, modal.currentCard.interval, modal.currentCard.ease, modal.currentCard.delayBeforeReview, modal.plugin.data.settings).interval;
        if (obsidian.Platform.isMobile) {
            modal.hardBtn.setText(textInterval(hardInterval, true));
            modal.goodBtn.setText(textInterval(goodInterval, true));
            modal.easyBtn.setText(textInterval(easyInterval, true));
        }
        else {
            modal.hardBtn.setText(`Hard - ${textInterval(hardInterval, false)}`);
            modal.goodBtn.setText(`Good - ${textInterval(goodInterval, false)}`);
            modal.easyBtn.setText(`Easy - ${textInterval(easyInterval, false)}`);
        }
    }
    else if (this.newFlashcards.length > 0) {
        if (getSetting("randomizeCardOrder", modal.plugin.data.settings))
            modal.currentCardIdx = Math.floor(Math.random() * this.newFlashcards.length);
        else
            modal.currentCardIdx = 0;
        modal.currentCard = this.newFlashcards[modal.currentCardIdx];
        modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);
        if (obsidian.Platform.isMobile) {
            modal.hardBtn.setText("1.0d");
            modal.goodBtn.setText("2.5d");
            modal.easyBtn.setText("3.5d");
        }
        else {
            modal.hardBtn.setText("Hard - 1.0 day");
            modal.goodBtn.setText("Good - 2.5 days");
            modal.easyBtn.setText("Easy - 3.5 days");
        }
    }
    if (getSetting("showContextInCards", modal.plugin.data.settings))
        modal.contextView.setText(modal.currentCard.context);
    if (getSetting("showFileNameInFileLink", modal.plugin.data.settings))
        modal.fileLinkView.setText(modal.currentCard.note.basename);
};

class StatsModal extends obsidian.Modal {
    dueDatesFlashcards;
    constructor(app, dueDatesFlashcards) {
        super(app);
        this.dueDatesFlashcards = dueDatesFlashcards;
        this.titleEl.setText("Statistics");
        if (obsidian.Platform.isMobile) {
            this.modalEl.style.height = "100%";
            this.modalEl.style.width = "100%";
            this.contentEl.style.display = "block";
        }
        else {
            this.modalEl.style.height = "100%";
            this.modalEl.style.width = "100%";
        }
    }
    onOpen() {
        let { contentEl } = this;
        contentEl.innerHTML +=
            "<div style='text-align:center'>" +
                "<span>Note that this requires the Obsidian Charts plugin to work</span>" +
                "<h2 style='text-align:center'>Forecast</h2>" +
                "<h4 style='text-align:center'>The number of cards due in the future</h4>" +
                "</div>";
        let text = "```chart\n" +
            "\ttype: bar\n" +
            `\tlabels: [${Object.keys(this.dueDatesFlashcards)}]\n` +
            "\tseries:\n" +
            "\t\t- title: Scheduled\n" +
            `\t\t  data: [${Object.values(this.dueDatesFlashcards)}]\n` +
            '\txTitle: "Days"\n' +
            '\tyTitle: "Number of cards"\n' +
            "\tlegend: false\n" +
            "\tstacked: true\n" +
            "````";
        obsidian.MarkdownRenderer.renderMarkdown(text, contentEl, null, null);
    }
    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

const REVIEW_QUEUE_VIEW_TYPE = "review-queue-list-view";
class ReviewQueueListView extends obsidian.ItemView {
    plugin;
    activeFolders;
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.activeFolders = new Set(["Today"]);
        this.registerEvent(this.app.workspace.on("file-open", (_) => this.redraw()));
        this.registerEvent(this.app.vault.on("rename", (_) => this.redraw()));
    }
    getViewType() {
        return REVIEW_QUEUE_VIEW_TYPE;
    }
    getDisplayText() {
        return "Notes Review Queue";
    }
    getIcon() {
        return "crosshairs";
    }
    onHeaderMenu(menu) {
        menu.addItem((item) => {
            item.setTitle("Close")
                .setIcon("cross")
                .onClick(() => {
                this.app.workspace.detachLeavesOfType(REVIEW_QUEUE_VIEW_TYPE);
            });
        });
    }
    redraw() {
        const openFile = this.app.workspace.getActiveFile();
        const rootEl = createDiv("nav-folder mod-root");
        const childrenEl = rootEl.createDiv("nav-folder-children");
        if (this.plugin.newNotes.length > 0) {
            let newNotesFolderEl = this.createRightPaneFolder(childrenEl, "New", !this.activeFolders.has("New"));
            for (let newFile of this.plugin.newNotes) {
                this.createRightPaneFile(newNotesFolderEl, newFile, openFile && newFile.path === openFile.path, !this.activeFolders.has("New"));
            }
        }
        if (this.plugin.scheduledNotes.length > 0) {
            let now = Date.now();
            let currUnix = -1;
            let folderEl, folderTitle;
            let maxDaysToRender = getSetting("maxNDaysNotesReviewQueue", this.plugin.data.settings);
            for (let sNote of this.plugin.scheduledNotes) {
                if (sNote.dueUnix != currUnix) {
                    let nDays = Math.ceil((sNote.dueUnix - now) / (24 * 3600 * 1000));
                    if (nDays > maxDaysToRender)
                        break;
                    folderTitle =
                        nDays == -1
                            ? "Yesterday"
                            : nDays == 0
                                ? "Today"
                                : nDays == 1
                                    ? "Tomorrow"
                                    : new Date(sNote.dueUnix).toDateString();
                    folderEl = this.createRightPaneFolder(childrenEl, folderTitle, !this.activeFolders.has(folderTitle));
                    currUnix = sNote.dueUnix;
                }
                this.createRightPaneFile(folderEl, sNote.note, openFile && sNote.note.path === openFile.path, !this.activeFolders.has(folderTitle));
            }
        }
        const contentEl = this.containerEl.children[1];
        contentEl.empty();
        contentEl.appendChild(rootEl);
    }
    createRightPaneFolder(parentEl, folderTitle, collapsed) {
        const folderEl = parentEl.createDiv("nav-folder");
        const folderTitleEl = folderEl.createDiv("nav-folder-title");
        const childrenEl = folderEl.createDiv("nav-folder-children");
        const collapseIconEl = folderTitleEl.createDiv("nav-folder-collapse-indicator collapse-icon");
        collapseIconEl.innerHTML = COLLAPSE_ICON;
        if (collapsed)
            collapseIconEl.childNodes[0].style.transform = "rotate(-90deg)";
        folderTitleEl
            .createDiv("nav-folder-title-content")
            .setText(folderTitle);
        folderTitleEl.onClickEvent((_) => {
            for (let child of childrenEl.childNodes) {
                if (child.style.display == "block" ||
                    child.style.display == "") {
                    child.style.display = "none";
                    collapseIconEl.childNodes[0].style.transform =
                        "rotate(-90deg)";
                    this.activeFolders.delete(folderTitle);
                }
                else {
                    child.style.display = "block";
                    collapseIconEl.childNodes[0].style.transform = "";
                    this.activeFolders.add(folderTitle);
                }
            }
        });
        return folderEl;
    }
    createRightPaneFile(folderEl, file, fileElActive, hidden) {
        const navFileEl = folderEl
            .getElementsByClassName("nav-folder-children")[0]
            .createDiv("nav-file");
        if (hidden)
            navFileEl.style.display = "none";
        const navFileTitle = navFileEl.createDiv("nav-file-title");
        if (fileElActive)
            navFileTitle.addClass("is-active");
        navFileTitle.createDiv("nav-file-title-content").setText(file.basename);
        navFileTitle.addEventListener("click", (event) => {
            event.preventDefault();
            this.app.workspace.activeLeaf.openFile(file);
            return false;
        }, false);
        navFileTitle.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            const fileMenu = new obsidian.Menu(this.app);
            this.app.workspace.trigger("file-menu", fileMenu, file, "my-context-menu", null);
            fileMenu.showAtPosition({
                x: event.pageX,
                y: event.pageY,
            });
            return false;
        }, false);
    }
}

const DEFAULT_DATA = {
    settings: DEFAULT_SETTINGS,
    buryDate: "",
    buryList: [],
};
class SRPlugin extends obsidian.Plugin {
    statusBar;
    reviewQueueView;
    data;
    newNotes = [];
    scheduledNotes = [];
    easeByPath = {};
    incomingLinks = {};
    pageranks = {};
    dueNotesCount = 0;
    dueDatesNotes = {}; // Record<# of days in future, due count>
    deckTree = new Deck("root", null);
    dueDatesFlashcards = {}; // Record<# of days in future, due count>
    singlelineCardRegex;
    multilineCardRegex;
    // prevent calling these functions if another instance is already running
    notesSyncLock = false;
    flashcardsSyncLock = false;
    async onload() {
        await this.loadPluginData();
        obsidian.addIcon("crosshairs", CROSS_HAIRS_ICON);
        this.statusBar = this.addStatusBarItem();
        this.statusBar.classList.add("mod-clickable");
        this.statusBar.setAttribute("aria-label", "Open a note for review");
        this.statusBar.setAttribute("aria-label-position", "top");
        this.statusBar.addEventListener("click", (_) => {
            if (!this.notesSyncLock) {
                this.sync();
                this.reviewNextNote();
            }
        });
        this.singlelineCardRegex = new RegExp(`^(.+)${escapeRegexString(getSetting("singlelineCardSeparator", this.data.settings))}(.+?)\\n?(?:<!--SR:(.+),(\\d+),(\\d+)-->|$)`, "gm");
        this.multilineCardRegex = new RegExp(`^((?:.+\\n)+)${escapeRegexString(getSetting("multilineCardSeparator", this.data.settings))}\\n((?:.+?\\n?)+?)(?:<!--SR:(.+),(\\d+),(\\d+)-->|$)`, "gm");
        this.addRibbonIcon("crosshairs", "Review flashcards", async () => {
            if (!this.flashcardsSyncLock) {
                await this.flashcards_sync();
                new FlashcardModal(this.app, this).open();
            }
        });
        this.registerView(REVIEW_QUEUE_VIEW_TYPE, (leaf) => (this.reviewQueueView = new ReviewQueueListView(leaf, this)));
        if (!this.data.settings.disableFileMenuReviewOptions) {
            this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
                menu.addItem((item) => {
                    item.setTitle("Review: Easy")
                        .setIcon("crosshairs")
                        .onClick((evt) => {
                        if (file.extension == "md")
                            this.saveReviewResponse(file, ReviewResponse.Easy);
                    });
                });
                menu.addItem((item) => {
                    item.setTitle("Review: Good")
                        .setIcon("crosshairs")
                        .onClick((evt) => {
                        if (file.extension == "md")
                            this.saveReviewResponse(file, ReviewResponse.Good);
                    });
                });
                menu.addItem((item) => {
                    item.setTitle("Review: Hard")
                        .setIcon("crosshairs")
                        .onClick((evt) => {
                        if (file.extension == "md")
                            this.saveReviewResponse(file, ReviewResponse.Hard);
                    });
                });
            }));
        }
        this.addCommand({
            id: "srs-note-review-open-note",
            name: "Open a note for review",
            callback: () => {
                if (!this.notesSyncLock) {
                    this.sync();
                    this.reviewNextNote();
                }
            },
        });
        this.addCommand({
            id: "srs-note-review-easy",
            name: "Review note as easy",
            callback: () => {
                const openFile = this.app.workspace.getActiveFile();
                if (openFile && openFile.extension == "md")
                    this.saveReviewResponse(openFile, ReviewResponse.Easy);
            },
        });
        this.addCommand({
            id: "srs-note-review-good",
            name: "Review note as good",
            callback: () => {
                const openFile = this.app.workspace.getActiveFile();
                if (openFile && openFile.extension == "md")
                    this.saveReviewResponse(openFile, ReviewResponse.Good);
            },
        });
        this.addCommand({
            id: "srs-note-review-hard",
            name: "Review note as hard",
            callback: () => {
                const openFile = this.app.workspace.getActiveFile();
                if (openFile && openFile.extension == "md")
                    this.saveReviewResponse(openFile, ReviewResponse.Hard);
            },
        });
        this.addCommand({
            id: "srs-review-flashcards",
            name: "Review flashcards",
            callback: async () => {
                if (!this.flashcardsSyncLock) {
                    await this.flashcards_sync();
                    new FlashcardModal(this.app, this).open();
                }
            },
        });
        this.addCommand({
            id: "srs-view-stats",
            name: "View statistics",
            callback: () => {
                new StatsModal(this.app, this.dueDatesFlashcards).open();
            },
        });
        this.addSettingTab(new SRSettingTab(this.app, this));
        this.app.workspace.onLayoutReady(() => {
            this.initView();
            setTimeout(() => this.sync(), 2000);
            setTimeout(() => this.flashcards_sync(), 2000);
        });
    }
    onunload() {
        this.app.workspace
            .getLeavesOfType(REVIEW_QUEUE_VIEW_TYPE)
            .forEach((leaf) => leaf.detach());
    }
    async sync() {
        if (this.notesSyncLock)
            return;
        this.notesSyncLock = true;
        let notes = this.app.vault.getMarkdownFiles();
        lib.reset();
        this.scheduledNotes = [];
        this.easeByPath = {};
        this.newNotes = [];
        this.incomingLinks = {};
        this.pageranks = {};
        this.dueNotesCount = 0;
        this.dueDatesNotes = {};
        let now = Date.now();
        for (let note of notes) {
            if (this.incomingLinks[note.path] == undefined)
                this.incomingLinks[note.path] = [];
            let links = this.app.metadataCache.resolvedLinks[note.path] || {};
            for (let targetPath in links) {
                if (this.incomingLinks[targetPath] == undefined)
                    this.incomingLinks[targetPath] = [];
                // markdown files only
                if (targetPath.split(".").pop().toLowerCase() == "md") {
                    this.incomingLinks[targetPath].push({
                        sourcePath: note.path,
                        linkCount: links[targetPath],
                    });
                    lib.link(note.path, targetPath, links[targetPath]);
                }
            }
            let fileCachedData = this.app.metadataCache.getFileCache(note) || {};
            let frontmatter = fileCachedData.frontmatter || {};
            let tags = obsidian.getAllTags(fileCachedData) || [];
            let shouldIgnore = true;
            outer: for (let tag of tags) {
                for (let tagToReview of this.data.settings.tagsToReview) {
                    if (tag == tagToReview ||
                        tag.startsWith(tagToReview + "/")) {
                        shouldIgnore = false;
                        break outer;
                    }
                }
            }
            if (shouldIgnore)
                continue;
            // file has no scheduling information
            if (!(frontmatter.hasOwnProperty("sr-due") &&
                frontmatter.hasOwnProperty("sr-interval") &&
                frontmatter.hasOwnProperty("sr-ease"))) {
                this.newNotes.push(note);
                continue;
            }
            let dueUnix = window
                .moment(frontmatter["sr-due"], [
                "YYYY-MM-DD",
                "DD-MM-YYYY",
                "ddd MMM DD YYYY",
            ])
                .valueOf();
            this.scheduledNotes.push({
                note,
                dueUnix,
            });
            this.easeByPath[note.path] = frontmatter["sr-ease"];
            if (dueUnix <= now)
                this.dueNotesCount++;
            let nDays = Math.ceil((dueUnix - now) / (24 * 3600 * 1000));
            if (!this.dueDatesNotes.hasOwnProperty(nDays))
                this.dueDatesNotes[nDays] = 0;
            this.dueDatesNotes[nDays]++;
        }
        lib.rank(0.85, 0.000001, (node, rank) => {
            this.pageranks[node] = rank * 10000;
        });
        // sort new notes by importance
        this.newNotes = this.newNotes.sort((a, b) => (this.pageranks[b.path] || 0) - (this.pageranks[a.path] || 0));
        // sort scheduled notes by date & within those days, sort them by importance
        this.scheduledNotes = this.scheduledNotes.sort((a, b) => {
            let result = a.dueUnix - b.dueUnix;
            if (result != 0)
                return result;
            return ((this.pageranks[b.note.path] || 0) -
                (this.pageranks[a.note.path] || 0));
        });
        let noteCountText = this.dueNotesCount == 1 ? "note" : "notes";
        let cardCountText = this.deckTree.dueFlashcardsCount == 1 ? "card" : "cards";
        this.statusBar.setText(`Review: ${this.dueNotesCount} ${noteCountText}, ${this.deckTree.dueFlashcardsCount} ${cardCountText} due`);
        this.reviewQueueView.redraw();
        this.notesSyncLock = false;
    }
    async saveReviewResponse(note, response) {
        let fileCachedData = this.app.metadataCache.getFileCache(note) || {};
        let frontmatter = fileCachedData.frontmatter || {};
        let tags = obsidian.getAllTags(fileCachedData) || [];
        let shouldIgnore = true;
        outer: for (let tag of tags) {
            for (let tagToReview of this.data.settings.tagsToReview) {
                if (tag == tagToReview || tag.startsWith(tagToReview + "/")) {
                    shouldIgnore = false;
                    break outer;
                }
            }
        }
        if (shouldIgnore) {
            new obsidian.Notice("Please tag the note appropriately for reviewing (in settings).");
            return;
        }
        let fileText = await this.app.vault.read(note);
        let ease, interval, delayBeforeReview;
        let now = Date.now();
        // new note
        if (!(frontmatter.hasOwnProperty("sr-due") &&
            frontmatter.hasOwnProperty("sr-interval") &&
            frontmatter.hasOwnProperty("sr-ease"))) {
            let linkTotal = 0, linkPGTotal = 0, totalLinkCount = 0;
            for (let statObj of this.incomingLinks[note.path] || []) {
                let ease = this.easeByPath[statObj.sourcePath];
                if (ease) {
                    linkTotal +=
                        statObj.linkCount *
                            this.pageranks[statObj.sourcePath] *
                            ease;
                    linkPGTotal +=
                        this.pageranks[statObj.sourcePath] * statObj.linkCount;
                    totalLinkCount += statObj.linkCount;
                }
            }
            let outgoingLinks = this.app.metadataCache.resolvedLinks[note.path] || {};
            for (let linkedFilePath in outgoingLinks) {
                let ease = this.easeByPath[linkedFilePath];
                if (ease) {
                    linkTotal +=
                        outgoingLinks[linkedFilePath] *
                            this.pageranks[linkedFilePath] *
                            ease;
                    linkPGTotal +=
                        this.pageranks[linkedFilePath] *
                            outgoingLinks[linkedFilePath];
                    totalLinkCount += outgoingLinks[linkedFilePath];
                }
            }
            let linkContribution = this.data.settings.maxLinkFactor *
                Math.min(1.0, Math.log(totalLinkCount + 0.5) / Math.log(64));
            ease = Math.round((1.0 - linkContribution) * this.data.settings.baseEase +
                (totalLinkCount > 0
                    ? (linkContribution * linkTotal) / linkPGTotal
                    : linkContribution * this.data.settings.baseEase));
            interval = 1;
            delayBeforeReview = 0;
        }
        else {
            interval = frontmatter["sr-interval"];
            ease = frontmatter["sr-ease"];
            delayBeforeReview =
                now -
                    window
                        .moment(frontmatter["sr-due"], [
                        "YYYY-MM-DD",
                        "DD-MM-YYYY",
                        "ddd MMM DD YYYY",
                    ])
                        .valueOf();
        }
        let schedObj = schedule(response, interval, ease, delayBeforeReview, this.data.settings, this.dueDatesNotes);
        interval = schedObj.interval;
        ease = schedObj.ease;
        let due = window.moment(now + interval * 24 * 3600 * 1000);
        let dueString = due.format("YYYY-MM-DD");
        // check if scheduling info exists
        if (SCHEDULING_INFO_REGEX.test(fileText)) {
            let schedulingInfo = SCHEDULING_INFO_REGEX.exec(fileText);
            fileText = fileText.replace(SCHEDULING_INFO_REGEX, `---\n${schedulingInfo[1]}sr-due: ${dueString}\nsr-interval: ${interval}\nsr-ease: ${ease}\n${schedulingInfo[5]}---`);
            // new note with existing YAML front matter
        }
        else if (YAML_FRONT_MATTER_REGEX.test(fileText)) {
            let existingYaml = YAML_FRONT_MATTER_REGEX.exec(fileText);
            fileText = fileText.replace(YAML_FRONT_MATTER_REGEX, `---\n${existingYaml[1]}sr-due: ${dueString}\nsr-interval: ${interval}\nsr-ease: ${ease}\n---`);
        }
        else {
            fileText = `---\nsr-due: ${dueString}\nsr-interval: ${interval}\nsr-ease: ${ease}\n---\n\n${fileText}`;
        }
        this.app.vault.modify(note, fileText);
        new obsidian.Notice("Response received.");
        setTimeout(() => {
            if (!this.notesSyncLock) {
                this.sync();
                if (this.data.settings.autoNextNote)
                    this.reviewNextNote();
            }
        }, 500);
    }
    async reviewNextNote() {
        if (this.dueNotesCount > 0) {
            let index = this.data.settings.openRandomNote
                ? Math.floor(Math.random() * this.dueNotesCount)
                : 0;
            this.app.workspace.activeLeaf.openFile(this.scheduledNotes[index].note);
            return;
        }
        if (this.newNotes.length > 0) {
            let index = this.data.settings.openRandomNote
                ? Math.floor(Math.random() * this.newNotes.length)
                : 0;
            this.app.workspace.activeLeaf.openFile(this.newNotes[index]);
            return;
        }
        new obsidian.Notice("You're done for the day :D.");
    }
    async flashcards_sync() {
        if (this.flashcardsSyncLock)
            return;
        this.flashcardsSyncLock = true;
        let notes = this.app.vault.getMarkdownFiles();
        this.deckTree = new Deck("root", null);
        this.dueDatesFlashcards = {};
        let todayDate = window.moment(Date.now()).format("YYYY-MM-DD");
        // clear list if we've changed dates
        if (todayDate != this.data.buryDate) {
            this.data.buryDate = todayDate;
            this.data.buryList = [];
        }
        for (let note of notes) {
            if (getSetting("convertFoldersToDecks", this.data.settings)) {
                let path = note.path.split("/");
                path.pop(); // remove filename
                await this.findFlashcards(note, "#" + path.join("/"));
                continue;
            }
            let fileCachedData = this.app.metadataCache.getFileCache(note) || {};
            fileCachedData.frontmatter || {};
            let tags = obsidian.getAllTags(fileCachedData) || [];
            outer: for (let tag of tags) {
                for (let tagToReview of this.data.settings.flashcardTags) {
                    if (tag == tagToReview ||
                        tag.startsWith(tagToReview + "/")) {
                        await this.findFlashcards(note, tag);
                        break outer;
                    }
                }
            }
        }
        // sort the deck names
        this.deckTree.sortSubdecksList();
        let noteCountText = this.dueNotesCount == 1 ? "note" : "notes";
        let cardCountText = this.deckTree.dueFlashcardsCount == 1 ? "card" : "cards";
        this.statusBar.setText(`Review: ${this.dueNotesCount} ${noteCountText}, ${this.deckTree.dueFlashcardsCount} ${cardCountText} due`);
        this.flashcardsSyncLock = false;
    }
    async findFlashcards(note, deckPathStr) {
        let fileText = await this.app.vault.read(note);
        let fileCachedData = this.app.metadataCache.getFileCache(note) || {};
        let headings = fileCachedData.headings || [];
        let fileChanged = false;
        let deckAdded = false;
        let deckPath = deckPathStr.substring(1).split("/");
        if (deckPath.length == 1 && deckPath[0] == "")
            deckPath = ["/"];
        // find all codeblocks
        let codeblocks = [];
        for (let regex of [CODEBLOCK_REGEX, INLINE_CODE_REGEX]) {
            for (let match of fileText.matchAll(regex))
                codeblocks.push([match.index, match.index + match[0].length]);
        }
        let now = Date.now();
        // basic cards
        for (let regex of [this.singlelineCardRegex, this.multilineCardRegex]) {
            let cardType = regex == this.singlelineCardRegex
                ? CardType.SingleLineBasic
                : CardType.MultiLineBasic;
            for (let match of fileText.matchAll(regex)) {
                if (inCodeblock(match.index, match[0].trim().length, codeblocks))
                    continue;
                if (!deckAdded) {
                    this.deckTree.createDeck([...deckPath]);
                    deckAdded = true;
                }
                let cardText = match[0].trim();
                let front = match[1].trim();
                let back = match[2].trim();
                let cardObj;
                // flashcard already scheduled
                if (match[3]) {
                    let dueUnix = window
                        .moment(match[3], [
                        "YYYY-MM-DD",
                        "DD-MM-YYYY",
                        "ddd MMM DD YYYY",
                    ])
                        .valueOf();
                    let nDays = Math.ceil((dueUnix - now) / (24 * 3600 * 1000));
                    if (!this.dueDatesFlashcards.hasOwnProperty(nDays))
                        this.dueDatesFlashcards[nDays] = 0;
                    this.dueDatesFlashcards[nDays]++;
                    if (this.data.buryList.includes(cyrb53(cardText))) {
                        this.deckTree.countFlashcard([...deckPath]);
                        continue;
                    }
                    if (dueUnix <= now) {
                        cardObj = {
                            isDue: true,
                            interval: parseInt(match[4]),
                            ease: parseInt(match[5]),
                            delayBeforeReview: now - dueUnix,
                            note,
                            front,
                            back,
                            cardText,
                            context: "",
                            cardType,
                        };
                        this.deckTree.insertFlashcard([...deckPath], cardObj);
                    }
                    else {
                        this.deckTree.countFlashcard([...deckPath]);
                        continue;
                    }
                }
                else {
                    cardObj = {
                        isDue: false,
                        note,
                        front,
                        back,
                        cardText,
                        context: "",
                        cardType,
                    };
                    this.deckTree.insertFlashcard([...deckPath], cardObj);
                }
                if (getSetting("showContextInCards", this.data.settings))
                    addContextToCard(cardObj, match.index, headings);
            }
        }
        // cloze deletion cards
        if (!getSetting("disableClozeCards", this.data.settings)) {
            for (let match of fileText.matchAll(CLOZE_CARD_DETECTOR)) {
                match[0] = match[0].trim();
                if (!deckAdded) {
                    this.deckTree.createDeck([...deckPath]);
                    deckAdded = true;
                }
                let cardText = match[0];
                let deletions = [];
                for (let m of cardText.matchAll(CLOZE_DELETIONS_EXTRACTOR)) {
                    if (inCodeblock(match.index + m.index, m[0].trim().length, codeblocks))
                        continue;
                    deletions.push(m);
                }
                let scheduling = [
                    ...cardText.matchAll(CLOZE_SCHEDULING_EXTRACTOR),
                ];
                // we have some extra scheduling dates to delete
                if (scheduling.length > deletions.length) {
                    let idxSched = cardText.lastIndexOf("<!--SR:") + 7;
                    let newCardText = cardText.substring(0, idxSched);
                    for (let i = 0; i < deletions.length; i++)
                        newCardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
                    newCardText += "-->\n";
                    let replacementRegex = new RegExp(escapeRegexString(cardText), "gm");
                    fileText = fileText.replace(replacementRegex, newCardText);
                    fileChanged = true;
                }
                let relatedCards = [];
                for (let i = 0; i < deletions.length; i++) {
                    let cardObj;
                    let deletionStart = deletions[i].index;
                    let deletionEnd = deletionStart + deletions[i][0].length;
                    let front = cardText.substring(0, deletionStart) +
                        "<span style='color:#2196f3'>[...]</span>" +
                        cardText.substring(deletionEnd);
                    front = front.replace(/==/gm, "");
                    let back = cardText.substring(0, deletionStart) +
                        "<span style='color:#2196f3'>" +
                        cardText.substring(deletionStart, deletionEnd) +
                        "</span>" +
                        cardText.substring(deletionEnd);
                    back = back.replace(/==/gm, "");
                    // card deletion scheduled
                    if (i < scheduling.length) {
                        let dueUnix = window
                            .moment(scheduling[i][1], [
                            "YYYY-MM-DD",
                            "DD-MM-YYYY",
                        ])
                            .valueOf();
                        let nDays = Math.ceil((dueUnix - now) / (24 * 3600 * 1000));
                        if (!this.dueDatesFlashcards.hasOwnProperty(nDays))
                            this.dueDatesFlashcards[nDays] = 0;
                        this.dueDatesFlashcards[nDays]++;
                        if (this.data.buryList.includes(cyrb53(cardText))) {
                            this.deckTree.countFlashcard([...deckPath]);
                            continue;
                        }
                        if (dueUnix <= now) {
                            cardObj = {
                                isDue: true,
                                interval: parseInt(scheduling[i][2]),
                                ease: parseInt(scheduling[i][3]),
                                delayBeforeReview: now - dueUnix,
                                note,
                                front,
                                back,
                                cardText: match[0],
                                context: "",
                                cardType: CardType.Cloze,
                                subCardIdx: i,
                                relatedCards,
                            };
                            this.deckTree.insertFlashcard([...deckPath], cardObj);
                        }
                        else {
                            this.deckTree.countFlashcard([...deckPath]);
                            continue;
                        }
                    }
                    else {
                        if (this.data.buryList.includes(cyrb53(cardText))) {
                            this.deckTree.countFlashcard([...deckPath]);
                            continue;
                        }
                        // new card
                        cardObj = {
                            isDue: false,
                            note,
                            front,
                            back,
                            cardText: match[0],
                            context: "",
                            cardType: CardType.Cloze,
                            subCardIdx: i,
                            relatedCards,
                        };
                        this.deckTree.insertFlashcard([...deckPath], cardObj);
                    }
                    relatedCards.push(cardObj);
                    if (getSetting("showContextInCards", this.data.settings))
                        addContextToCard(cardObj, match.index, headings);
                }
            }
        }
        if (fileChanged)
            await this.app.vault.modify(note, fileText);
    }
    async loadPluginData() {
        this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
    }
    async savePluginData() {
        await this.saveData(this.data);
    }
    initView() {
        if (this.app.workspace.getLeavesOfType(REVIEW_QUEUE_VIEW_TYPE).length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: REVIEW_QUEUE_VIEW_TYPE,
            active: true,
        });
    }
}
function addContextToCard(cardObj, cardOffset, headings) {
    let stack = [];
    for (let heading of headings) {
        if (heading.position.start.offset > cardOffset)
            break;
        while (stack.length > 0 &&
            stack[stack.length - 1].level >= heading.level)
            stack.pop();
        stack.push(heading);
    }
    for (let headingObj of stack)
        cardObj.context += headingObj.heading + " > ";
    cardObj.context = cardObj.context.slice(0, -3);
}
function inCodeblock(matchStart, matchLength, codeblocks) {
    for (let codeblock of codeblocks) {
        if (matchStart >= codeblock[0] &&
            matchStart + matchLength <= codeblock[1])
            return true;
    }
    return false;
}

module.exports = SRPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3BhZ2VyYW5rLmpzL2xpYi9pbmRleC5qcyIsInNyYy91dGlscy50cyIsInNyYy9zZXR0aW5ncy50cyIsInNyYy90eXBlcy50cyIsInNyYy9zY2hlZC50cyIsInNyYy9jb25zdGFudHMudHMiLCJzcmMvZmxhc2hjYXJkLW1vZGFsLnRzIiwic3JjL3N0YXRzLW1vZGFsLnRzIiwic3JjL3NpZGViYXIudHMiLCJzcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGZvck93bihvYmplY3QsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JykgJiYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKGtleSwgb2JqZWN0W2tleV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHtcbiAgICAgICAgY291bnQ6IDAsXG4gICAgICAgIGVkZ2VzOiB7fSxcbiAgICAgICAgbm9kZXM6IHt9XG4gICAgfTtcblxuICAgIHNlbGYubGluayA9IGZ1bmN0aW9uIChzb3VyY2UsIHRhcmdldCwgd2VpZ2h0KSB7XG4gICAgICAgIGlmICgoaXNGaW5pdGUod2VpZ2h0KSAhPT0gdHJ1ZSkgfHwgKHdlaWdodCA9PT0gbnVsbCkpIHtcbiAgICAgICAgICAgIHdlaWdodCA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHdlaWdodCA9IHBhcnNlRmxvYXQod2VpZ2h0KTtcblxuICAgICAgICBpZiAoc2VsZi5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShzb3VyY2UpICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBzZWxmLmNvdW50Kys7XG4gICAgICAgICAgICBzZWxmLm5vZGVzW3NvdXJjZV0gPSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwLFxuICAgICAgICAgICAgICAgIG91dGJvdW5kOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5ub2Rlc1tzb3VyY2VdLm91dGJvdW5kICs9IHdlaWdodDtcblxuICAgICAgICBpZiAoc2VsZi5ub2Rlcy5oYXNPd25Qcm9wZXJ0eSh0YXJnZXQpICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBzZWxmLmNvdW50Kys7XG4gICAgICAgICAgICBzZWxmLm5vZGVzW3RhcmdldF0gPSB7XG4gICAgICAgICAgICAgICAgd2VpZ2h0OiAwLFxuICAgICAgICAgICAgICAgIG91dGJvdW5kOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuZWRnZXMuaGFzT3duUHJvcGVydHkoc291cmNlKSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2VsZi5lZGdlc1tzb3VyY2VdID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5lZGdlc1tzb3VyY2VdLmhhc093blByb3BlcnR5KHRhcmdldCkgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHNlbGYuZWRnZXNbc291cmNlXVt0YXJnZXRdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuZWRnZXNbc291cmNlXVt0YXJnZXRdICs9IHdlaWdodDtcbiAgICB9O1xuXG4gICAgc2VsZi5yYW5rID0gZnVuY3Rpb24gKGFscGhhLCBlcHNpbG9uLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsdGEgPSAxLFxuICAgICAgICAgICAgaW52ZXJzZSA9IDEgLyBzZWxmLmNvdW50O1xuXG4gICAgICAgIGZvck93bihzZWxmLmVkZ2VzLCBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5ub2Rlc1tzb3VyY2VdLm91dGJvdW5kID4gMCkge1xuICAgICAgICAgICAgICAgIGZvck93bihzZWxmLmVkZ2VzW3NvdXJjZV0sIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5lZGdlc1tzb3VyY2VdW3RhcmdldF0gLz0gc2VsZi5ub2Rlc1tzb3VyY2VdLm91dGJvdW5kO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmb3JPd24oc2VsZi5ub2RlcywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgc2VsZi5ub2Rlc1trZXldLndlaWdodCA9IGludmVyc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdoaWxlIChkZWx0YSA+IGVwc2lsb24pIHtcbiAgICAgICAgICAgIHZhciBsZWFrID0gMCxcbiAgICAgICAgICAgICAgICBub2RlcyA9IHt9O1xuXG4gICAgICAgICAgICBmb3JPd24oc2VsZi5ub2RlcywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBub2Rlc1trZXldID0gdmFsdWUud2VpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLm91dGJvdW5kID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxlYWsgKz0gdmFsdWUud2VpZ2h0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNlbGYubm9kZXNba2V5XS53ZWlnaHQgPSAwO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxlYWsgKj0gYWxwaGE7XG5cbiAgICAgICAgICAgIGZvck93bihzZWxmLm5vZGVzLCBmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgICAgICAgICAgZm9yT3duKHNlbGYuZWRnZXNbc291cmNlXSwgZnVuY3Rpb24gKHRhcmdldCwgd2VpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubm9kZXNbdGFyZ2V0XS53ZWlnaHQgKz0gYWxwaGEgKiBub2Rlc1tzb3VyY2VdICogd2VpZ2h0O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2VsZi5ub2Rlc1tzb3VyY2VdLndlaWdodCArPSAoMSAtIGFscGhhKSAqIGludmVyc2UgKyBsZWFrICogaW52ZXJzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBkZWx0YSA9IDA7XG5cbiAgICAgICAgICAgIGZvck93bihzZWxmLm5vZGVzLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGRlbHRhICs9IE1hdGguYWJzKHZhbHVlLndlaWdodCAtIG5vZGVzW2tleV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JPd24oc2VsZi5ub2RlcywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGtleSwgc2VsZi5ub2Rlc1trZXldLndlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzZWxmLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmNvdW50ID0gMDtcbiAgICAgICAgc2VsZi5lZGdlcyA9IHt9O1xuICAgICAgICBzZWxmLm5vZGVzID0ge307XG4gICAgfTtcblxuICAgIHJldHVybiBzZWxmO1xufSkoKTtcbiIsIi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS82OTY5NDg2XG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnZXhTdHJpbmcodGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG59XG5cbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4ODY2MDcxL2phdmFzY3JpcHQtcmVwbGFjZS1tZXRob2QtZG9sbGFyLXNpZ25zXG5leHBvcnQgZnVuY3Rpb24gZml4RG9sbGFyU2lnbnModGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGV4dC5zcGxpdChcIiQkXCIpLmpvaW4oXCIkJCRcIik7XG59XG5cbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81MjE3MTQ4MFxuZXhwb3J0IGZ1bmN0aW9uIGN5cmI1MyhzdHI6IHN0cmluZywgc2VlZDogbnVtYmVyID0gMCk6IHN0cmluZyB7XG4gICAgbGV0IGgxID0gMHhkZWFkYmVlZiBeIHNlZWQsXG4gICAgICAgIGgyID0gMHg0MWM2Y2U1NyBeIHNlZWQ7XG4gICAgZm9yIChsZXQgaSA9IDAsIGNoOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNoID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gY2gsIDI2NTQ0MzU3NjEpO1xuICAgICAgICBoMiA9IE1hdGguaW11bChoMiBeIGNoLCAxNTk3MzM0Njc3KTtcbiAgICB9XG4gICAgaDEgPVxuICAgICAgICBNYXRoLmltdWwoaDEgXiAoaDEgPj4+IDE2KSwgMjI0NjgyMjUwNykgXlxuICAgICAgICBNYXRoLmltdWwoaDIgXiAoaDIgPj4+IDEzKSwgMzI2NjQ4OTkwOSk7XG4gICAgaDIgPVxuICAgICAgICBNYXRoLmltdWwoaDIgXiAoaDIgPj4+IDE2KSwgMjI0NjgyMjUwNykgXlxuICAgICAgICBNYXRoLmltdWwoaDEgXiAoaDEgPj4+IDEzKSwgMzI2NjQ4OTkwOSk7XG4gICAgcmV0dXJuICg0Mjk0OTY3Mjk2ICogKDIwOTcxNTEgJiBoMikgKyAoaDEgPj4+IDApKS50b1N0cmluZygxNik7XG59XG4iLCJpbXBvcnQgeyBOb3RpY2UsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIEFwcCB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgU1JQbHVnaW4gZnJvbSBcIi4vbWFpblwiO1xuaW1wb3J0IHsgU1JTZXR0aW5ncyB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBlc2NhcGVSZWdleFN0cmluZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBTUlNldHRpbmdzID0ge1xuICAgIC8vIGZsYXNoY2FyZHNcbiAgICBmbGFzaGNhcmRUYWdzOiBbXCIjZmxhc2hjYXJkc1wiXSxcbiAgICBjb252ZXJ0Rm9sZGVyc1RvRGVja3M6IGZhbHNlLFxuICAgIGNhcmRDb21tZW50T25TYW1lTGluZTogZmFsc2UsXG4gICAgYnVyeVJlbGF0ZWRDYXJkczogZmFsc2UsXG4gICAgc2hvd0NvbnRleHRJbkNhcmRzOiB0cnVlLFxuICAgIGxhcmdlU2NyZWVuTW9kZTogZmFsc2UsXG4gICAgc2hvd0ZpbGVOYW1lSW5GaWxlTGluazogZmFsc2UsXG4gICAgcmFuZG9taXplQ2FyZE9yZGVyOiB0cnVlLFxuICAgIGRpc2FibGVDbG96ZUNhcmRzOiBmYWxzZSxcbiAgICBkaXNhYmxlU2luZ2xlbGluZUNhcmRzOiBmYWxzZSxcbiAgICBzaW5nbGVsaW5lQ2FyZFNlcGFyYXRvcjogXCI6OlwiLFxuICAgIGRpc2FibGVTaW5nbGVsaW5lUmV2ZXJzZWRDYXJkczogZmFsc2UsXG4gICAgc2luZ2xlbGluZVJldmVyc2VkQ2FyZFNlcGFyYXRvcjogXCI6OjpcIixcbiAgICBkaXNhYmxlTXVsdGlsaW5lQ2FyZHM6IGZhbHNlLFxuICAgIG11bHRpbGluZUNhcmRTZXBhcmF0b3I6IFwiP1wiLFxuICAgIGRpc2FibGVNdWx0aWxpbmVSZXZlcnNlZENhcmRzOiBmYWxzZSxcbiAgICBtdWx0aWxpbmVSZXZlcnNlZENhcmRTZXBhcmF0b3I6IFwiPz9cIixcbiAgICAvLyBub3Rlc1xuICAgIHRhZ3NUb1JldmlldzogW1wiI3Jldmlld1wiXSxcbiAgICBvcGVuUmFuZG9tTm90ZTogZmFsc2UsXG4gICAgYXV0b05leHROb3RlOiBmYWxzZSxcbiAgICBkaXNhYmxlRmlsZU1lbnVSZXZpZXdPcHRpb25zOiBmYWxzZSxcbiAgICBtYXhORGF5c05vdGVzUmV2aWV3UXVldWU6IDM2NSxcbiAgICAvLyBhbGdvcml0aG1cbiAgICBiYXNlRWFzZTogMjUwLFxuICAgIGxhcHNlc0ludGVydmFsQ2hhbmdlOiAwLjUsXG4gICAgZWFzeUJvbnVzOiAxLjMsXG4gICAgbWF4aW11bUludGVydmFsOiAzNjUyNSxcbiAgICBtYXhMaW5rRmFjdG9yOiAxLjAsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2V0dGluZyhcbiAgICBzZXR0aW5nTmFtZToga2V5b2YgU1JTZXR0aW5ncyxcbiAgICBzZXR0aW5nc09iajogU1JTZXR0aW5nc1xuKTogYW55IHtcbiAgICBsZXQgdmFsdWU6IGFueSA9IHNldHRpbmdzT2JqW3NldHRpbmdOYW1lXTtcbiAgICB2YWx1ZSA/Pz0gREVGQVVMVF9TRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbWdtZXllcnMvb2JzaWRpYW4ta2FuYmFuL2Jsb2IvbWFpbi9zcmMvU2V0dGluZ3MudHNcbmxldCBhcHBseURlYm91bmNlVGltZXI6IG51bWJlciA9IDA7XG5mdW5jdGlvbiBhcHBseVNldHRpbmdzVXBkYXRlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQge1xuICAgIGNsZWFyVGltZW91dChhcHBseURlYm91bmNlVGltZXIpO1xuICAgIGFwcGx5RGVib3VuY2VUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCA1MTIpO1xufVxuXG5leHBvcnQgY2xhc3MgU1JTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gICAgcHJpdmF0ZSBwbHVnaW46IFNSUGx1Z2luO1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogU1JQbHVnaW4pIHtcbiAgICAgICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB9XG5cbiAgICBkaXNwbGF5KCkge1xuICAgICAgICBsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZURpdigpLmlubmVySFRNTCA9XG4gICAgICAgICAgICBcIjxoMj5TcGFjZWQgUmVwZXRpdGlvbiBQbHVnaW4gLSBTZXR0aW5nczwvaDI+XCI7XG5cbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRGl2KCkuaW5uZXJIVE1MID1cbiAgICAgICAgICAgICdGb3IgbW9yZSBpbmZvcm1hdGlvbiwgY2hlY2sgdGhlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vc3QzdjNubXcvb2JzaWRpYW4tc3BhY2VkLXJlcGV0aXRpb24vd2lraVwiPndpa2k8L2E+Lic7XG5cbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRGl2KCkuaW5uZXJIVE1MID0gXCI8aDM+Rmxhc2hjYXJkczwvaDM+XCI7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIkZsYXNoY2FyZCB0YWdzXCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICBcIkVudGVyIHRhZ3Mgc2VwYXJhdGVkIGJ5IHNwYWNlcyBvciBuZXdsaW5lcyBpLmUuICNmbGFzaGNhcmRzICNkZWNrMiAjZGVjazMuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSgodGV4dCkgPT5cbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2dldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmbGFzaGNhcmRUYWdzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAgICAgKS5qb2luKFwiIFwiKX1gXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlTZXR0aW5nc1VwZGF0ZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5mbGFzaGNhcmRUYWdzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuc3BsaXQoL1xccysvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJDb252ZXJ0IGZvbGRlcnMgdG8gZGVja3MgYW5kIHN1YmRlY2tzP1wiKVxuICAgICAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgICAgICAgXCJUaGlzIGlzIGFuIGFsdGVybmF0aXZlIHRvIHRoZSBGbGFzaGNhcmQgdGFncyBvcHRpb24gYWJvdmUuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvbnZlcnRGb2xkZXJzVG9EZWNrc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmNvbnZlcnRGb2xkZXJzVG9EZWNrcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcbiAgICAgICAgICAgICAgICBcIlNhdmUgc2NoZWR1bGluZyBjb21tZW50IG9uIHRoZSBzYW1lIGxpbmUgYXMgdGhlIGZsYXNoY2FyZCdzIGxhc3QgbGluZT9cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgICAgICAgXCJUdXJuaW5nIHRoaXMgb24gd2lsbCBtYWtlIHRoZSBIVE1MIGNvbW1lbnRzIG5vdCBicmVhayBsaXN0IGZvcm1hdHRpbmcuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNhcmRDb21tZW50T25TYW1lTGluZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmNhcmRDb21tZW50T25TYW1lTGluZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIkJ1cnkgcmVsYXRlZCBjYXJkcyB1bnRpbCB0aGUgbmV4dCBkYXk/XCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlRoaXMgYXBwbGllcyB0byBvdGhlciBjbG96ZSBkZWxldGlvbnMgaW4gY2xvemUgY2FyZHMuXCIpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJidXJ5UmVsYXRlZENhcmRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MuYnVyeVJlbGF0ZWRDYXJkcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIlNob3cgY29udGV4dCBpbiBjYXJkcz9cIilcbiAgICAgICAgICAgIC5zZXREZXNjKFwiaS5lLiBUaXRsZSA+IEhlYWRpbmcgMSA+IFN1YmhlYWRpbmcgPiAuLi4gPiBTdWJoZWFkaW5nXCIpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaG93Q29udGV4dEluQ2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5zaG93Q29udGV4dEluQ2FyZHMgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJSZXZpZXcgY2FyZHMgaW4gbGFyZ2Ugc2NyZWVuIG1vZGU/XCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcIltEZXNrdG9wXSBTaG91bGQgYmUgdXNlZnVsIGlmIHlvdSBoYXZlIHZlcnkgbGFyZ2UgaW1hZ2VzXCIpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXCJsYXJnZVNjcmVlbk1vZGVcIiwgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmxhcmdlU2NyZWVuTW9kZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcbiAgICAgICAgICAgICAgICBcIlNob3cgZmlsZSBuYW1lIGluc3RlYWQgb2YgJ09wZW4gZmlsZScgaW4gZmxhc2hjYXJkIHJldmlldz9cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICAgICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRTZXR0aW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2hvd0ZpbGVOYW1lSW5GaWxlTGlua1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLnNob3dGaWxlTmFtZUluRmlsZUxpbmsgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIlJhbmRvbWl6ZSBjYXJkIG9yZGVyIGR1cmluZyByZXZpZXc/XCIpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyYW5kb21pemVDYXJkT3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5yYW5kb21pemVDYXJkT3JkZXIgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJEaXNhYmxlIGNsb3plIGNhcmRzP1wiKVxuICAgICAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgICAgICAgXCJJZiB5b3UncmUgbm90IGN1cnJlbnRseSB1c2luZyAnZW0gJiB3b3VsZCBsaWtlIHRoZSBwbHVnaW4gdG8gcnVuIGEgdGFkIGZhc3Rlci5cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICAgICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRTZXR0aW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZUNsb3plQ2FyZHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5kaXNhYmxlQ2xvemVDYXJkcyA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIlNlcGFyYXRvciBmb3IgaW5saW5lIGZsYXNoY2FyZHNcIilcbiAgICAgICAgICAgIC5zZXREZXNjKFxuICAgICAgICAgICAgICAgIFwiTm90ZSB0aGF0IGFmdGVyIGNoYW5naW5nIHRoaXMgeW91IGhhdmUgdG8gbWFudWFsbHkgZWRpdCBhbnkgZmxhc2hjYXJkcyB5b3UgYWxyZWFkeSBoYXZlLlwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2dldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaW5nbGVsaW5lQ2FyZFNlcGFyYXRvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICl9YFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZSgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5U2V0dGluZ3NVcGRhdGUoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3Muc2luZ2xlbGluZUNhcmRTZXBhcmF0b3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNpbmdsZWxpbmVDYXJkUmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgXiguKykke2VzY2FwZVJlZ2V4U3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX0oLis/KVxcXFxuPyg/OjwhLS1TUjooLispLChcXFxcZCspLChcXFxcZCspLS0+fCQpYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJnbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZEV4dHJhQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLnNldEljb24oXCJyZXNldFwiKVxuICAgICAgICAgICAgICAgICAgICAuc2V0VG9vbHRpcChcIlJlc2V0IHRvIGRlZmF1bHRcIilcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5zaW5nbGVsaW5lQ2FyZFNlcGFyYXRvciA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgREVGQVVMVF9TRVRUSU5HUy5zaW5nbGVsaW5lQ2FyZFNlcGFyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiU2VwYXJhdG9yIGZvciBtdWx0aWxpbmUgZmxhc2hjYXJkc1wiKVxuICAgICAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgICAgICAgXCJOb3RlIHRoYXQgYWZ0ZXIgY2hhbmdpbmcgdGhpcyB5b3UgaGF2ZSB0byBtYW51YWxseSBlZGl0IGFueSBmbGFzaGNhcmRzIHlvdSBhbHJlYWR5IGhhdmUuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7Z2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm11bHRpbGluZUNhcmRTZXBhcmF0b3JcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseVNldHRpbmdzVXBkYXRlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLm11bHRpbGluZUNhcmRTZXBhcmF0b3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLm11bHRpbGluZUNhcmRSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBeKCg/Oi4rXFxcXG4pKykke2VzY2FwZVJlZ2V4U3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cXFxcbigoPzouKz9cXFxcbj8pKz8pKD86PCEtLVNSOiguKyksKFxcXFxkKyksKFxcXFxkKyktLT58JClgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImdtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuYWRkRXh0cmFCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbihcInJlc2V0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRUb29sdGlwKFwiUmVzZXQgdG8gZGVmYXVsdFwiKVxuICAgICAgICAgICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLm11bHRpbGluZUNhcmRTZXBhcmF0b3IgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERFRkFVTFRfU0VUVElOR1MubXVsdGlsaW5lQ2FyZFNlcGFyYXRvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVEaXYoKS5pbm5lckhUTUwgPSBcIjxoMz5Ob3RlczwvaDM+XCI7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIlRhZ3MgdG8gcmV2aWV3XCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICBcIkVudGVyIHRhZ3Mgc2VwYXJhdGVkIGJ5IHNwYWNlcyBvciBuZXdsaW5lcyBpLmUuICNyZXZpZXcgI3RhZzIgI3RhZzMuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSgodGV4dCkgPT5cbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2dldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0YWdzVG9SZXZpZXdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApLmpvaW4oXCIgXCIpfWBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseVNldHRpbmdzVXBkYXRlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLnRhZ3NUb1JldmlldyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNwbGl0KC9cXHMrLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiT3BlbiBhIHJhbmRvbSBub3RlIGZvciByZXZpZXdcIilcbiAgICAgICAgICAgIC5zZXREZXNjKFxuICAgICAgICAgICAgICAgIFwiV2hlbiB5b3UgdHVybiB0aGlzIG9mZiwgbm90ZXMgYXJlIG9yZGVyZWQgYnkgaW1wb3J0YW5jZSAoUGFnZVJhbmspLlwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXCJvcGVuUmFuZG9tTm90ZVwiLCB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3Mub3BlblJhbmRvbU5vdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJPcGVuIG5leHQgbm90ZSBhdXRvbWF0aWNhbGx5IGFmdGVyIGEgcmV2aWV3XCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcIkZvciBmYXN0ZXIgcmV2aWV3cy5cIilcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcImF1dG9OZXh0Tm90ZVwiLCB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MuYXV0b05leHROb3RlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFxuICAgICAgICAgICAgICAgIFwiRGlzYWJsZSByZXZpZXcgb3B0aW9ucyBpbiB0aGUgZmlsZSBtZW51IGkuZS4gUmV2aWV3OiBFYXN5IEdvb2QgSGFyZFwiXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICBcIkFmdGVyIGRpc2FibGluZywgeW91IGNhbiByZXZpZXcgdXNpbmcgdGhlIGNvbW1hbmQgaG90a2V5cy4gUmVsb2FkIE9ic2lkaWFuIGFmdGVyIGNoYW5naW5nIHRoaXMuXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgICAgICAgICB0b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVGaWxlTWVudVJldmlld09wdGlvbnNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5kaXNhYmxlRmlsZU1lbnVSZXZpZXdPcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJNYXhpbXVtIG51bWJlciBvZiBkYXlzIHRvIGRpc3BsYXkgb24gcmlnaHQgcGFuZWxcIilcbiAgICAgICAgICAgIC5zZXREZXNjKFwiUmVkdWNlIHRoaXMgZm9yIGEgY2xlYW5lciBpbnRlcmZhY2UuXCIpXG4gICAgICAgICAgICAuYWRkVGV4dCgodGV4dCkgPT5cbiAgICAgICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2dldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXhORGF5c05vdGVzUmV2aWV3UXVldWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseVNldHRpbmdzVXBkYXRlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbnVtVmFsdWU6IG51bWJlciA9IE51bWJlci5wYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihudW1WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoZSBudW1iZXIgb2YgZGF5cyBtdXN0IGJlIGF0IGxlYXN0IDEuXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0LnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MubWF4TkRheXNOb3Rlc1Jldmlld1F1ZXVlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLm1heE5EYXlzTm90ZXNSZXZpZXdRdWV1ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCBudW1iZXIuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZEV4dHJhQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLnNldEljb24oXCJyZXNldFwiKVxuICAgICAgICAgICAgICAgICAgICAuc2V0VG9vbHRpcChcIlJlc2V0IHRvIGRlZmF1bHRcIilcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5tYXhORGF5c05vdGVzUmV2aWV3UXVldWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERFRkFVTFRfU0VUVElOR1MubWF4TkRheXNOb3Rlc1Jldmlld1F1ZXVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZURpdigpLmlubmVySFRNTCA9IFwiPGgzPkFsZ29yaXRobTwvaDM+XCI7XG5cbiAgICAgICAgY29udGFpbmVyRWwuY3JlYXRlRGl2KCkuaW5uZXJIVE1MID1cbiAgICAgICAgICAgICdGb3IgbW9yZSBpbmZvcm1hdGlvbiwgY2hlY2sgdGhlIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vc3QzdjNubXcvb2JzaWRpYW4tc3BhY2VkLXJlcGV0aXRpb24vd2lraS9TcGFjZWQtUmVwZXRpdGlvbi1BbGdvcml0aG1cIj5hbGdvcml0aG0gaW1wbGVtZW50YXRpb248L2E+Lic7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIkJhc2UgZWFzZVwiKVxuICAgICAgICAgICAgLnNldERlc2MoXCJtaW5pbXVtID0gMTMwLCBwcmVmZXJyYWJseSBhcHByb3hpbWF0ZWx5IDI1MC5cIilcbiAgICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7Z2V0U2V0dGluZyhcImJhc2VFYXNlXCIsIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MpfWBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBseVNldHRpbmdzVXBkYXRlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbnVtVmFsdWU6IG51bWJlciA9IE51bWJlci5wYXJzZUludCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihudW1WYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlIDwgMTMwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhlIGJhc2UgZWFzZSBtdXN0IGJlIGF0IGxlYXN0IDEzMC5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5iYXNlRWFzZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5iYXNlRWFzZSA9IG51bVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJQbGVhc2UgcHJvdmlkZSBhIHZhbGlkIG51bWJlci5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuYWRkRXh0cmFCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbihcInJlc2V0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRUb29sdGlwKFwiUmVzZXQgdG8gZGVmYXVsdFwiKVxuICAgICAgICAgICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmJhc2VFYXNlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBERUZBVUxUX1NFVFRJTkdTLmJhc2VFYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJJbnRlcnZhbCBjaGFuZ2Ugd2hlbiB5b3UgcmV2aWV3IGEgZmxhc2hjYXJkL25vdGUgYXMgaGFyZFwiKVxuICAgICAgICAgICAgLnNldERlc2MoXCJuZXdJbnRlcnZhbCA9IG9sZEludGVydmFsICogaW50ZXJ2YWxDaGFuZ2UgLyAxMDAuXCIpXG4gICAgICAgICAgICAuYWRkU2xpZGVyKChzbGlkZXIpID0+XG4gICAgICAgICAgICAgICAgc2xpZGVyXG4gICAgICAgICAgICAgICAgICAgIC5zZXRMaW1pdHMoMSwgOTksIDEpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYXBzZXNJbnRlcnZhbENoYW5nZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKiAxMDBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAuc2V0RHluYW1pY1Rvb2x0aXAoKVxuICAgICAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MubGFwc2VzSW50ZXJ2YWxDaGFuZ2UgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuYWRkRXh0cmFCdXR0b24oKGJ1dHRvbikgPT4ge1xuICAgICAgICAgICAgICAgIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbihcInJlc2V0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRUb29sdGlwKFwiUmVzZXQgdG8gZGVmYXVsdFwiKVxuICAgICAgICAgICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmxhcHNlc0ludGVydmFsQ2hhbmdlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBERUZBVUxUX1NFVFRJTkdTLmxhcHNlc0ludGVydmFsQ2hhbmdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJFYXN5IGJvbnVzXCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICBcIlRoZSBlYXN5IGJvbnVzIGFsbG93cyB5b3UgdG8gc2V0IHRoZSBkaWZmZXJlbmNlIGluIGludGVydmFscyBiZXR3ZWVuIGFuc3dlcmluZyBHb29kIGFuZCBFYXN5IG9uIGEgZmxhc2hjYXJkL25vdGUgKG1pbmltdW0gPSAxMDAlKS5cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRTZXR0aW5nKFwiZWFzeUJvbnVzXCIsIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MpICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1gXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlTZXR0aW5nc1VwZGF0ZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG51bVZhbHVlOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQodmFsdWUpIC8gMTAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4obnVtVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZSA8IDEuMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoZSBlYXN5IGJvbnVzIG11c3QgYmUgYXQgbGVhc3QgMTAwLlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVhc3lCb251cyAqIDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5lYXN5Qm9udXMgPSBudW1WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgTm90aWNlKFwiUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCBudW1iZXIuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZEV4dHJhQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLnNldEljb24oXCJyZXNldFwiKVxuICAgICAgICAgICAgICAgICAgICAuc2V0VG9vbHRpcChcIlJlc2V0IHRvIGRlZmF1bHRcIilcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5lYXN5Qm9udXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERFRkFVTFRfU0VUVElOR1MuZWFzeUJvbnVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVBsdWdpbkRhdGEoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJNYXhpbXVtIEludGVydmFsXCIpXG4gICAgICAgICAgICAuc2V0RGVzYyhcbiAgICAgICAgICAgICAgICBcIkFsbG93cyB5b3UgdG8gcGxhY2UgYW4gdXBwZXIgbGltaXQgb24gdGhlIGludGVydmFsIChkZWZhdWx0ID0gMTAwIHllYXJzKS5cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgICAgICAgICAgdGV4dFxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtnZXRTZXR0aW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF4aW11bUludGVydmFsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICAgICAgKX1gXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlTZXR0aW5nc1VwZGF0ZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG51bVZhbHVlOiBudW1iZXIgPSBOdW1iZXIucGFyc2VJbnQodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4obnVtVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZSA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBOb3RpY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJUaGUgbWF4aW11bSBpbnRlcnZhbCBtdXN0IGJlIGF0IGxlYXN0IDEgZGF5LlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dC5zZXRWYWx1ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLm1heGltdW1JbnRlcnZhbH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5tYXhpbXVtSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShcIlBsZWFzZSBwcm92aWRlIGEgdmFsaWQgbnVtYmVyLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRFeHRyYUJ1dHRvbigoYnV0dG9uKSA9PiB7XG4gICAgICAgICAgICAgICAgYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIC5zZXRJY29uKFwicmVzZXRcIilcbiAgICAgICAgICAgICAgICAgICAgLnNldFRvb2x0aXAoXCJSZXNldCB0byBkZWZhdWx0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MubWF4aW11bUludGVydmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBERUZBVUxUX1NFVFRJTkdTLm1heGltdW1JbnRlcnZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVQbHVnaW5EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiTWF4aW11bSBsaW5rIGNvbnRyaWJ1dGlvblwiKVxuICAgICAgICAgICAgLnNldERlc2MoXG4gICAgICAgICAgICAgICAgXCJNYXhpbXVtIGNvbnRyaWJ1dGlvbiBvZiB0aGUgd2VpZ2h0ZWQgZWFzZSBvZiBsaW5rZWQgbm90ZXMgdG8gdGhlIGluaXRpYWwgZWFzZS5cIlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZFNsaWRlcigoc2xpZGVyKSA9PlxuICAgICAgICAgICAgICAgIHNsaWRlclxuICAgICAgICAgICAgICAgICAgICAuc2V0TGltaXRzKDAsIDEwMCwgMSlcbiAgICAgICAgICAgICAgICAgICAgLnNldFZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcIm1heExpbmtGYWN0b3JcIiwgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncykgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEwMFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIC5zZXREeW5hbWljVG9vbHRpcCgpXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5tYXhMaW5rRmFjdG9yID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmFkZEV4dHJhQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgICAgICAgICBidXR0b25cbiAgICAgICAgICAgICAgICAgICAgLnNldEljb24oXCJyZXNldFwiKVxuICAgICAgICAgICAgICAgICAgICAuc2V0VG9vbHRpcChcIlJlc2V0IHRvIGRlZmF1bHRcIilcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5tYXhMaW5rRmFjdG9yID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBERUZBVUxUX1NFVFRJTkdTLm1heExpbmtGYWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IEZsYXNoY2FyZE1vZGFsIH0gZnJvbSBcIi4vZmxhc2hjYXJkLW1vZGFsXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU1JTZXR0aW5ncyB7XG4gICAgLy8gZmxhc2hjYXJkc1xuICAgIGZsYXNoY2FyZFRhZ3M6IHN0cmluZ1tdO1xuICAgIGNvbnZlcnRGb2xkZXJzVG9EZWNrczogYm9vbGVhbjtcbiAgICBjYXJkQ29tbWVudE9uU2FtZUxpbmU6IGJvb2xlYW47XG4gICAgYnVyeVJlbGF0ZWRDYXJkczogYm9vbGVhbjtcbiAgICBzaG93Q29udGV4dEluQ2FyZHM6IGJvb2xlYW47XG4gICAgbGFyZ2VTY3JlZW5Nb2RlOiBib29sZWFuO1xuICAgIHNob3dGaWxlTmFtZUluRmlsZUxpbms6IGJvb2xlYW47XG4gICAgcmFuZG9taXplQ2FyZE9yZGVyOiBib29sZWFuO1xuICAgIGRpc2FibGVDbG96ZUNhcmRzOiBib29sZWFuO1xuICAgIGRpc2FibGVTaW5nbGVsaW5lQ2FyZHM6IGJvb2xlYW47XG4gICAgc2luZ2xlbGluZUNhcmRTZXBhcmF0b3I6IHN0cmluZztcbiAgICBkaXNhYmxlU2luZ2xlbGluZVJldmVyc2VkQ2FyZHM6IGJvb2xlYW47XG4gICAgc2luZ2xlbGluZVJldmVyc2VkQ2FyZFNlcGFyYXRvcjogc3RyaW5nO1xuICAgIGRpc2FibGVNdWx0aWxpbmVDYXJkczogYm9vbGVhbjtcbiAgICBtdWx0aWxpbmVDYXJkU2VwYXJhdG9yOiBzdHJpbmc7XG4gICAgZGlzYWJsZU11bHRpbGluZVJldmVyc2VkQ2FyZHM6IGJvb2xlYW47XG4gICAgbXVsdGlsaW5lUmV2ZXJzZWRDYXJkU2VwYXJhdG9yOiBzdHJpbmc7XG4gICAgLy8gbm90ZXNcbiAgICB0YWdzVG9SZXZpZXc6IHN0cmluZ1tdO1xuICAgIG9wZW5SYW5kb21Ob3RlOiBib29sZWFuO1xuICAgIGF1dG9OZXh0Tm90ZTogYm9vbGVhbjtcbiAgICBkaXNhYmxlRmlsZU1lbnVSZXZpZXdPcHRpb25zOiBib29sZWFuO1xuICAgIG1heE5EYXlzTm90ZXNSZXZpZXdRdWV1ZTogbnVtYmVyO1xuICAgIC8vIGFsZ29yaXRobVxuICAgIGJhc2VFYXNlOiBudW1iZXI7XG4gICAgbGFwc2VzSW50ZXJ2YWxDaGFuZ2U6IG51bWJlcjtcbiAgICBlYXN5Qm9udXM6IG51bWJlcjtcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG51bWJlcjtcbiAgICBtYXhMaW5rRmFjdG9yOiBudW1iZXI7XG59XG5cbmV4cG9ydCBlbnVtIFJldmlld1Jlc3BvbnNlIHtcbiAgICBFYXN5LFxuICAgIEdvb2QsXG4gICAgSGFyZCxcbiAgICBSZXNldCxcbn1cblxuLy8gTm90ZXNcblxuZXhwb3J0IGludGVyZmFjZSBTY2hlZE5vdGUge1xuICAgIG5vdGU6IFRGaWxlO1xuICAgIGR1ZVVuaXg6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMaW5rU3RhdCB7XG4gICAgc291cmNlUGF0aDogc3RyaW5nO1xuICAgIGxpbmtDb3VudDogbnVtYmVyO1xufVxuXG4vLyBEZWNrc1xuXG5leHBvcnQgY2xhc3MgRGVjayB7XG4gICAgcHVibGljIGRlY2tOYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIG5ld0ZsYXNoY2FyZHM6IENhcmRbXTtcbiAgICBwdWJsaWMgbmV3Rmxhc2hjYXJkc0NvdW50OiBudW1iZXIgPSAwOyAvLyBjb3VudHMgdGhvc2UgaW4gc3ViZGVja3MgdG9vXG4gICAgcHVibGljIGR1ZUZsYXNoY2FyZHM6IENhcmRbXTtcbiAgICBwdWJsaWMgZHVlRmxhc2hjYXJkc0NvdW50OiBudW1iZXIgPSAwOyAvLyBjb3VudHMgdGhvc2UgaW4gc3ViZGVja3MgdG9vXG4gICAgcHVibGljIHRvdGFsRmxhc2hjYXJkczogbnVtYmVyID0gMDsgLy8gY291bnRzIHRob3NlIGluIHN1YmRlY2tzIHRvb1xuICAgIHB1YmxpYyBzdWJkZWNrczogRGVja1tdO1xuICAgIHB1YmxpYyBwYXJlbnQ6IERlY2s7XG5cbiAgICBjb25zdHJ1Y3RvcihkZWNrTmFtZTogc3RyaW5nLCBwYXJlbnQ6IERlY2spIHtcbiAgICAgICAgdGhpcy5kZWNrTmFtZSA9IGRlY2tOYW1lO1xuICAgICAgICB0aGlzLm5ld0ZsYXNoY2FyZHMgPSBbXTtcbiAgICAgICAgdGhpcy5uZXdGbGFzaGNhcmRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmR1ZUZsYXNoY2FyZHMgPSBbXTtcbiAgICAgICAgdGhpcy5kdWVGbGFzaGNhcmRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnRvdGFsRmxhc2hjYXJkcyA9IDA7XG4gICAgICAgIHRoaXMuc3ViZGVja3MgPSBbXTtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgfVxuXG4gICAgY3JlYXRlRGVjayhkZWNrUGF0aDogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKGRlY2tQYXRoLmxlbmd0aCA9PSAwKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGRlY2tOYW1lOiBzdHJpbmcgPSBkZWNrUGF0aC5zaGlmdCgpO1xuICAgICAgICBmb3IgKGxldCBkZWNrIG9mIHRoaXMuc3ViZGVja3MpIHtcbiAgICAgICAgICAgIGlmIChkZWNrTmFtZSA9PSBkZWNrLmRlY2tOYW1lKSB7XG4gICAgICAgICAgICAgICAgZGVjay5jcmVhdGVEZWNrKGRlY2tQYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVjazogRGVjayA9IG5ldyBEZWNrKGRlY2tOYW1lLCB0aGlzKTtcbiAgICAgICAgdGhpcy5zdWJkZWNrcy5wdXNoKGRlY2spO1xuICAgICAgICBkZWNrLmNyZWF0ZURlY2soZGVja1BhdGgpO1xuICAgIH1cblxuICAgIGluc2VydEZsYXNoY2FyZChkZWNrUGF0aDogc3RyaW5nW10sIGNhcmRPYmo6IENhcmQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGNhcmRPYmouaXNEdWUpIHRoaXMuZHVlRmxhc2hjYXJkc0NvdW50Kys7XG4gICAgICAgIGVsc2UgdGhpcy5uZXdGbGFzaGNhcmRzQ291bnQrKztcbiAgICAgICAgdGhpcy50b3RhbEZsYXNoY2FyZHMrKztcblxuICAgICAgICBpZiAoZGVja1BhdGgubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIGlmIChjYXJkT2JqLmlzRHVlKSB0aGlzLmR1ZUZsYXNoY2FyZHMucHVzaChjYXJkT2JqKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5uZXdGbGFzaGNhcmRzLnB1c2goY2FyZE9iaik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVja05hbWU6IHN0cmluZyA9IGRlY2tQYXRoLnNoaWZ0KCk7XG4gICAgICAgIGZvciAobGV0IGRlY2sgb2YgdGhpcy5zdWJkZWNrcykge1xuICAgICAgICAgICAgaWYgKGRlY2tOYW1lID09IGRlY2suZGVja05hbWUpIHtcbiAgICAgICAgICAgICAgICBkZWNrLmluc2VydEZsYXNoY2FyZChkZWNrUGF0aCwgY2FyZE9iaik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY291bnQgZmxhc2hjYXJkcyB0aGF0IGhhdmUgZWl0aGVyIGJlZW4gYnVyaWVkXG4gICAgLy8gb3IgYXJlbid0IGR1ZSB5ZXRcbiAgICBjb3VudEZsYXNoY2FyZChkZWNrUGF0aDogc3RyaW5nW10pOiB2b2lkIHtcbiAgICAgICAgdGhpcy50b3RhbEZsYXNoY2FyZHMrKztcblxuICAgICAgICBsZXQgZGVja05hbWU6IHN0cmluZyA9IGRlY2tQYXRoLnNoaWZ0KCk7XG4gICAgICAgIGZvciAobGV0IGRlY2sgb2YgdGhpcy5zdWJkZWNrcykge1xuICAgICAgICAgICAgaWYgKGRlY2tOYW1lID09IGRlY2suZGVja05hbWUpIHtcbiAgICAgICAgICAgICAgICBkZWNrLmNvdW50Rmxhc2hjYXJkKGRlY2tQYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWxldGVGbGFzaGNhcmRBdEluZGV4KGluZGV4OiBudW1iZXIsIGNhcmRJc0R1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBpZiAoY2FyZElzRHVlKSB0aGlzLmR1ZUZsYXNoY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgZWxzZSB0aGlzLm5ld0ZsYXNoY2FyZHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgICAgICBsZXQgZGVjazogRGVjayA9IHRoaXM7XG4gICAgICAgIHdoaWxlIChkZWNrICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYXJkSXNEdWUpIGRlY2suZHVlRmxhc2hjYXJkc0NvdW50LS07XG4gICAgICAgICAgICBlbHNlIGRlY2submV3Rmxhc2hjYXJkc0NvdW50LS07XG4gICAgICAgICAgICBkZWNrID0gZGVjay5wYXJlbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0U3ViZGVja3NMaXN0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnN1YmRlY2tzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmRlY2tOYW1lIDwgYi5kZWNrTmFtZSkgcmV0dXJuIC0xO1xuICAgICAgICAgICAgZWxzZSBpZiAoYS5kZWNrTmFtZSA+IGIuZGVja05hbWUpIHJldHVybiAxO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGRlY2sgb2YgdGhpcy5zdWJkZWNrcykgZGVjay5zb3J0U3ViZGVja3NMaXN0KCk7XG4gICAgfVxuXG4gICAgLy8gaW1wbGVtZW50ZWQgaW4gZmxhc2hjYXJkLW1vZGVsLnRzXG4gICAgcmVuZGVyKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCwgbW9kYWw6IEZsYXNoY2FyZE1vZGFsKTogdm9pZCB7fVxuICAgIG5leHRDYXJkKG1vZGFsOiBGbGFzaGNhcmRNb2RhbCk6IHZvaWQge31cbn1cblxuLy8gRmxhc2hjYXJkc1xuXG5leHBvcnQgZW51bSBDYXJkVHlwZSB7XG4gICAgU2luZ2xlTGluZUJhc2ljLFxuICAgIE11bHRpTGluZUJhc2ljLFxuICAgIENsb3plLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENhcmQge1xuICAgIC8vIHNjaGVkdWxpbmdcbiAgICBpc0R1ZTogYm9vbGVhbjtcbiAgICBpbnRlcnZhbD86IG51bWJlcjtcbiAgICBlYXNlPzogbnVtYmVyO1xuICAgIGRlbGF5QmVmb3JlUmV2aWV3PzogbnVtYmVyO1xuICAgIC8vIG5vdGVcbiAgICBub3RlOiBURmlsZTtcbiAgICAvLyB2aXN1YWxzXG4gICAgZnJvbnQ6IHN0cmluZztcbiAgICBiYWNrOiBzdHJpbmc7XG4gICAgY2FyZFRleHQ6IHN0cmluZztcbiAgICBjb250ZXh0OiBzdHJpbmc7XG4gICAgLy8gdHlwZXNcbiAgICBjYXJkVHlwZTogQ2FyZFR5cGU7XG4gICAgLy8gc3R1ZmYgZm9yIGNhcmRzIHdpdGggc3ViLWNhcmRzXG4gICAgc3ViQ2FyZElkeD86IG51bWJlcjtcbiAgICByZWxhdGVkQ2FyZHM/OiBDYXJkW107XG59XG5cbmV4cG9ydCBlbnVtIEZsYXNoY2FyZE1vZGFsTW9kZSB7XG4gICAgRGVja3NMaXN0LFxuICAgIEZyb250LFxuICAgIEJhY2ssXG4gICAgQ2xvc2VkLFxufVxuIiwiaW1wb3J0IHsgUmV2aWV3UmVzcG9uc2UsIFNSU2V0dGluZ3MgfSBmcm9tIFwiLi90eXBlc1wiO1xuaW1wb3J0IHsgZ2V0U2V0dGluZyB9IGZyb20gXCIuL3NldHRpbmdzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZShcbiAgICByZXNwb25zZTogUmV2aWV3UmVzcG9uc2UsXG4gICAgaW50ZXJ2YWw6IG51bWJlcixcbiAgICBlYXNlOiBudW1iZXIsXG4gICAgZGVsYXlCZWZvcmVSZXZpZXc6IG51bWJlcixcbiAgICBzZXR0aW5nc09iajogU1JTZXR0aW5ncyxcbiAgICBkdWVEYXRlcz86IFJlY29yZDxudW1iZXIsIG51bWJlcj5cbikge1xuICAgIGxldCBsYXBzZXNJbnRlcnZhbENoYW5nZTogbnVtYmVyID0gZ2V0U2V0dGluZyhcbiAgICAgICAgXCJsYXBzZXNJbnRlcnZhbENoYW5nZVwiLFxuICAgICAgICBzZXR0aW5nc09ialxuICAgICk7XG4gICAgbGV0IGVhc3lCb251czogbnVtYmVyID0gZ2V0U2V0dGluZyhcImVhc3lCb251c1wiLCBzZXR0aW5nc09iaik7XG4gICAgbGV0IG1heGltdW1JbnRlcnZhbDogbnVtYmVyID0gZ2V0U2V0dGluZyhcIm1heGltdW1JbnRlcnZhbFwiLCBzZXR0aW5nc09iaik7XG5cbiAgICBkZWxheUJlZm9yZVJldmlldyA9IE1hdGgubWF4KFxuICAgICAgICAwLFxuICAgICAgICBNYXRoLmZsb29yKGRlbGF5QmVmb3JlUmV2aWV3IC8gKDI0ICogMzYwMCAqIDEwMDApKVxuICAgICk7XG5cbiAgICBpZiAocmVzcG9uc2UgPT0gUmV2aWV3UmVzcG9uc2UuRWFzeSkge1xuICAgICAgICBlYXNlICs9IDIwO1xuICAgICAgICBpbnRlcnZhbCA9ICgoaW50ZXJ2YWwgKyBkZWxheUJlZm9yZVJldmlldykgKiBlYXNlKSAvIDEwMDtcbiAgICAgICAgaW50ZXJ2YWwgKj0gZWFzeUJvbnVzO1xuICAgIH0gZWxzZSBpZiAocmVzcG9uc2UgPT0gUmV2aWV3UmVzcG9uc2UuR29vZCkge1xuICAgICAgICBpbnRlcnZhbCA9ICgoaW50ZXJ2YWwgKyBkZWxheUJlZm9yZVJldmlldyAvIDIpICogZWFzZSkgLyAxMDA7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZSA9PSBSZXZpZXdSZXNwb25zZS5IYXJkKSB7XG4gICAgICAgIGVhc2UgPSBNYXRoLm1heCgxMzAsIGVhc2UgLSAyMCk7XG4gICAgICAgIGludGVydmFsID0gTWF0aC5tYXgoXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgKGludGVydmFsICsgZGVsYXlCZWZvcmVSZXZpZXcgLyA0KSAqIGxhcHNlc0ludGVydmFsQ2hhbmdlXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gcmVwbGFjZXMgcmFuZG9tIGZ1enogd2l0aCBsb2FkIGJhbGFuY2luZyBvdmVyIHRoZSBmdXp6IGludGVydmFsXG4gICAgaWYgKGR1ZURhdGVzICE9IG51bGwpIHtcbiAgICAgICAgaW50ZXJ2YWwgPSBNYXRoLnJvdW5kKGludGVydmFsKTtcbiAgICAgICAgaWYgKCFkdWVEYXRlcy5oYXNPd25Qcm9wZXJ0eShpbnRlcnZhbCkpIGR1ZURhdGVzW2ludGVydmFsXSA9IDA7XG5cbiAgICAgICAgbGV0IGZ1enpSYW5nZTogW251bWJlciwgbnVtYmVyXTtcbiAgICAgICAgaWYgKGludGVydmFsIDwgMikgZnV6elJhbmdlID0gWzEsIDFdO1xuICAgICAgICBlbHNlIGlmIChpbnRlcnZhbCA9PSAyKSBmdXp6UmFuZ2UgPSBbMiwgM107XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGZ1eno6IG51bWJlcjtcbiAgICAgICAgICAgIGlmIChpbnRlcnZhbCA8IDcpIGZ1enogPSAxO1xuICAgICAgICAgICAgZWxzZSBpZiAoaW50ZXJ2YWwgPCAzMClcbiAgICAgICAgICAgICAgICBmdXp6ID0gTWF0aC5tYXgoMiwgTWF0aC5mbG9vcihpbnRlcnZhbCAqIDAuMTUpKTtcbiAgICAgICAgICAgIGVsc2UgZnV6eiA9IE1hdGgubWF4KDQsIE1hdGguZmxvb3IoaW50ZXJ2YWwgKiAwLjA1KSk7XG4gICAgICAgICAgICBmdXp6UmFuZ2UgPSBbaW50ZXJ2YWwgLSBmdXp6LCBpbnRlcnZhbCArIGZ1enpdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaXZsID0gZnV6elJhbmdlWzBdOyBpdmwgPD0gZnV6elJhbmdlWzFdOyBpdmwrKykge1xuICAgICAgICAgICAgaWYgKCFkdWVEYXRlcy5oYXNPd25Qcm9wZXJ0eShpdmwpKSBkdWVEYXRlc1tpdmxdID0gMDtcbiAgICAgICAgICAgIGlmIChkdWVEYXRlc1tpdmxdIDwgZHVlRGF0ZXNbaW50ZXJ2YWxdKSBpbnRlcnZhbCA9IGl2bDtcbiAgICAgICAgfVxuXG4gICAgICAgIGR1ZURhdGVzW2ludGVydmFsXSsrO1xuICAgIH1cblxuICAgIGludGVydmFsID0gTWF0aC5taW4oaW50ZXJ2YWwsIG1heGltdW1JbnRlcnZhbCk7XG5cbiAgICByZXR1cm4geyBpbnRlcnZhbDogTWF0aC5yb3VuZChpbnRlcnZhbCAqIDEwKSAvIDEwLCBlYXNlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0SW50ZXJ2YWwoaW50ZXJ2YWw6IG51bWJlciwgaXNNb2JpbGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIGxldCBtOiBudW1iZXIgPSBNYXRoLnJvdW5kKGludGVydmFsIC8gMykgLyAxMDtcbiAgICBsZXQgeTogbnVtYmVyID0gTWF0aC5yb3VuZChpbnRlcnZhbCAvIDM2LjUpIC8gMTA7XG5cbiAgICBpZiAoaXNNb2JpbGUpIHtcbiAgICAgICAgaWYgKGludGVydmFsIDwgMzApIHJldHVybiBgJHtpbnRlcnZhbH1kYDtcbiAgICAgICAgZWxzZSBpZiAoaW50ZXJ2YWwgPCAzNjUpIHJldHVybiBgJHttfW1gO1xuICAgICAgICBlbHNlIHJldHVybiBgJHt5fXlgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpbnRlcnZhbCA8IDMwKVxuICAgICAgICAgICAgcmV0dXJuIGludGVydmFsID09IDEuMCA/IFwiMS4wIGRheVwiIDogYCR7aW50ZXJ2YWx9IGRheXNgO1xuICAgICAgICBlbHNlIGlmIChpbnRlcnZhbCA8IDM2NSkgcmV0dXJuIG0gPT0gMS4wID8gXCIxLjAgbW9udGhcIiA6IGAke219IG1vbnRoc2A7XG4gICAgICAgIGVsc2UgcmV0dXJuIHkgPT0gMS4wID8gXCIxLjAgeWVhclwiIDogYCR7eX0geWVhcnNgO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjb25zdCBTQ0hFRFVMSU5HX0lORk9fUkVHRVg6IFJlZ0V4cCA9XG4gICAgL14tLS1cXG4oKD86LipcXG4pKilzci1kdWU6ICguKylcXG5zci1pbnRlcnZhbDogKFxcZCspXFxuc3ItZWFzZTogKFxcZCspXFxuKCg/Oi4qXFxuKSopLS0tLztcbmV4cG9ydCBjb25zdCBZQU1MX0ZST05UX01BVFRFUl9SRUdFWDogUmVnRXhwID0gL14tLS1cXG4oKD86LipcXG4pKj8pLS0tLztcblxuZXhwb3J0IGNvbnN0IENMT1pFX0NBUkRfREVURUNUT1I6IFJlZ0V4cCA9XG4gICAgLyg/Oi4rXFxuKSpeLio/PT0uKj89PS4qXFxuKD86LitcXG4/KSovZ207IC8vIGNhcmQgbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBjbG96ZVxuZXhwb3J0IGNvbnN0IENMT1pFX0RFTEVUSU9OU19FWFRSQUNUT1I6IFJlZ0V4cCA9IC89PSguKj8pPT0vZ207XG5leHBvcnQgY29uc3QgQ0xPWkVfU0NIRURVTElOR19FWFRSQUNUT1I6IFJlZ0V4cCA9IC8hKFtcXGQtXSspLChcXGQrKSwoXFxkKykvZ207XG5cbmV4cG9ydCBjb25zdCBDT0RFQkxPQ0tfUkVHRVg6IFJlZ0V4cCA9IC9gYGAoPzouKlxcbikqP2BgYC9nbTtcbmV4cG9ydCBjb25zdCBJTkxJTkVfQ09ERV9SRUdFWDogUmVnRXhwID0gL2AoPyFgKS4rYC9nbTtcblxuZXhwb3J0IGNvbnN0IENST1NTX0hBSVJTX0lDT046IHN0cmluZyA9IGA8cGF0aCBzdHlsZT1cIiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOmN1cnJlbnRDb2xvcjtmaWxsLW9wYWNpdHk6MTtcIiBkPVwiTSA5OS45MjE4NzUgNDcuOTQxNDA2IEwgOTMuMDc0MjE5IDQ3Ljk0MTQwNiBDIDkyLjg0Mzc1IDQyLjAzMTI1IDkxLjM5MDYyNSAzNi4yMzgyODEgODguODAwNzgxIDMwLjkyMTg3NSBMIDg1LjM2NzE4OCAzMi41ODIwMzEgQyA4Ny42Njc5NjkgMzcuMzU1NDY5IDg4Ljk2NDg0NCA0Mi41NTA3ODEgODkuMTgzNTk0IDQ3Ljg0Mzc1IEwgODIuMjM4MjgxIDQ3Ljg0Mzc1IEMgODIuMDk3NjU2IDQ0LjYxNzE4OCA4MS41ODk4NDQgNDEuNDE3OTY5IDgwLjczNDM3NSAzOC4zMDQ2ODggTCA3Ny4wNTA3ODEgMzkuMzM1OTM4IEMgNzcuODA4NTk0IDQyLjA4OTg0NCA3OC4yNjE3MTkgNDQuOTE3OTY5IDc4LjQwNjI1IDQ3Ljc2OTUzMSBMIDY1Ljg3MTA5NCA0Ny43Njk1MzEgQyA2NC45MTQwNjIgNDAuNTA3ODEyIDU5LjE0NDUzMSAzNC44MzIwMzEgNTEuODcxMDk0IDMzLjk5NjA5NCBMIDUxLjg3MTA5NCAyMS4zODY3MTkgQyA1NC44MTY0MDYgMjEuNTA3ODEyIDU3Ljc0MjE4OCAyMS45NjA5MzggNjAuNTg1OTM4IDIyLjczODI4MSBMIDYxLjYxNzE4OCAxOS4wNTg1OTQgQyA1OC40Mzc1IDE4LjE5MTQwNiA1NS4xNjQwNjIgMTcuNjkxNDA2IDUxLjg3MTA5NCAxNy41NzAzMTIgTCA1MS44NzEwOTQgMTAuNTUwNzgxIEMgNTcuMTY0MDYyIDEwLjc2OTUzMSA2Mi4zNTU0NjkgMTIuMDY2NDA2IDY3LjEzMjgxMiAxNC4zNjMyODEgTCA2OC43ODkwNjIgMTAuOTI5Njg4IEMgNjMuNSA4LjM4MjgxMiA1Ny43MzgyODEgNi45NTMxMjUgNTEuODcxMDk0IDYuNzM0Mzc1IEwgNTEuODcxMDk0IDAuMDM5MDYyNSBMIDQ4LjA1NDY4OCAwLjAzOTA2MjUgTCA0OC4wNTQ2ODggNi43MzQzNzUgQyA0Mi4xNzk2ODggNi45NzY1NjIgMzYuNDE3OTY5IDguNDMzNTk0IDMxLjEzMjgxMiAxMS4wMDc4MTIgTCAzMi43OTI5NjkgMTQuNDQxNDA2IEMgMzcuNTY2NDA2IDEyLjE0MDYyNSA0Mi43NjE3MTkgMTAuODQzNzUgNDguMDU0Njg4IDEwLjYyNSBMIDQ4LjA1NDY4OCAxNy41NzAzMTIgQyA0NC44MjgxMjUgMTcuNzE0ODQ0IDQxLjYyODkwNiAxOC4yMTg3NSAzOC41MTU2MjUgMTkuMDc4MTI1IEwgMzkuNTQ2ODc1IDIyLjc1NzgxMiBDIDQyLjMyNDIxOSAyMS45ODgyODEgNDUuMTc1NzgxIDIxLjUzMTI1IDQ4LjA1NDY4OCAyMS4zODY3MTkgTCA0OC4wNTQ2ODggMzQuMDMxMjUgQyA0MC43OTY4NzUgMzQuOTQ5MjE5IDM1LjA4OTg0NCA0MC42Nzk2ODggMzQuMjAzMTI1IDQ3Ljk0MTQwNiBMIDIxLjUgNDcuOTQxNDA2IEMgMjEuNjMyODEyIDQ1LjA0Mjk2OSAyMi4wODk4NDQgNDIuMTcxODc1IDIyLjg1NTQ2OSAzOS4zNzUgTCAxOS4xNzE4NzUgMzguMzQzNzUgQyAxOC4zMTI1IDQxLjQ1NzAzMSAxNy44MDg1OTQgNDQuNjU2MjUgMTcuNjY0MDYyIDQ3Ljg4MjgxMiBMIDEwLjY2NDA2MiA0Ny44ODI4MTIgQyAxMC44ODI4MTIgNDIuNTg5ODQ0IDEyLjE3OTY4OCAzNy4zOTQ1MzEgMTQuNDgwNDY5IDMyLjYyMTA5NCBMIDExLjEyMTA5NCAzMC45MjE4NzUgQyA4LjUzNTE1NiAzNi4yMzgyODEgNy4wNzgxMjUgNDIuMDMxMjUgNi44NDc2NTYgNDcuOTQxNDA2IEwgMCA0Ny45NDE0MDYgTCAwIDUxLjc1MzkwNiBMIDYuODQ3NjU2IDUxLjc1MzkwNiBDIDcuMDg5ODQ0IDU3LjYzNjcxOSA4LjU0Mjk2OSA2My40MDIzNDQgMTEuMTIxMDk0IDY4LjY5NTMxMiBMIDE0LjU1NDY4OCA2Ny4wMzUxNTYgQyAxMi4yNTc4MTIgNjIuMjYxNzE5IDEwLjk1NzAzMSA1Ny4wNjY0MDYgMTAuNzM4MjgxIDUxLjc3MzQzOCBMIDE3Ljc0MjE4OCA1MS43NzM0MzggQyAxNy44NTU0NjkgNTUuMDQyOTY5IDE4LjM0Mzc1IDU4LjI4OTA2MiAxOS4xOTE0MDYgNjEuNDQ1MzEyIEwgMjIuODcxMDk0IDYwLjQxNDA2MiBDIDIyLjA4OTg0NCA1Ny41NjI1IDIxLjYyODkwNiA1NC42MzI4MTIgMjEuNSA1MS42Nzk2ODggTCAzNC4yMDMxMjUgNTEuNjc5Njg4IEMgMzUuMDU4NTk0IDU4Ljk2ODc1IDQwLjc3MzQzOCA2NC43MzgyODEgNDguMDU0Njg4IDY1LjY2MDE1NiBMIDQ4LjA1NDY4OCA3OC4zMDg1OTQgQyA0NS4xMDU0NjkgNzguMTg3NSA0Mi4xODM1OTQgNzcuNzMwNDY5IDM5LjMzNTkzOCA3Ni45NTcwMzEgTCAzOC4zMDQ2ODggODAuNjM2NzE5IEMgNDEuNDg4MjgxIDgxLjUxMTcxOSA0NC43NTc4MTIgODIuMDE1NjI1IDQ4LjA1NDY4OCA4Mi4xNDQ1MzEgTCA0OC4wNTQ2ODggODkuMTQ0NTMxIEMgNDIuNzYxNzE5IDg4LjkyNTc4MSAzNy41NjY0MDYgODcuNjI4OTA2IDMyLjc5Mjk2OSA4NS4zMjgxMjUgTCAzMS4xMzI4MTIgODguNzY1NjI1IEMgMzYuNDI1NzgxIDkxLjMxMjUgNDIuMTgzNTk0IDkyLjc0MjE4OCA0OC4wNTQ2ODggOTIuOTYwOTM4IEwgNDguMDU0Njg4IDk5Ljk2MDkzOCBMIDUxLjg3MTA5NCA5OS45NjA5MzggTCA1MS44NzEwOTQgOTIuOTYwOTM4IEMgNTcuNzUgOTIuNzE4NzUgNjMuNTE5NTMxIDkxLjI2NTYyNSA2OC44MDg1OTQgODguNjg3NSBMIDY3LjEzMjgxMiA4NS4yNTM5MDYgQyA2Mi4zNTU0NjkgODcuNTUwNzgxIDU3LjE2NDA2MiA4OC44NTE1NjIgNTEuODcxMDk0IDg5LjA3MDMxMiBMIDUxLjg3MTA5NCA4Mi4xMjUgQyA1NS4wOTM3NSA4MS45ODA0NjkgNTguMjkyOTY5IDgxLjQ3NjU2MiA2MS40MDYyNSA4MC42MTcxODggTCA2MC4zNzg5MDYgNzYuOTM3NSBDIDU3LjU3NDIxOSA3Ny43MDMxMjUgNTQuNjk1MzEyIDc4LjE1NjI1IDUxLjc5Mjk2OSA3OC4yODkwNjIgTCA1MS43OTI5NjkgNjUuNjc5Njg4IEMgNTkuMTIxMDk0IDY0LjgyODEyNSA2NC45MTAxNTYgNTkuMDYyNSA2NS43OTY4NzUgNTEuNzM0Mzc1IEwgNzguMzY3MTg4IDUxLjczNDM3NSBDIDc4LjI1IDU0LjczNDM3NSA3Ny43ODkwNjIgNTcuNzEwOTM4IDc2Ljk5MjE4OCA2MC42MDU0NjkgTCA4MC42NzU3ODEgNjEuNjM2NzE5IEMgODEuNTU4NTk0IDU4LjQwNjI1IDgyLjA2NjQwNiA1NS4wODIwMzEgODIuMTgzNTk0IDUxLjczNDM3NSBMIDg5LjI2MTcxOSA1MS43MzQzNzUgQyA4OS4wNDI5NjkgNTcuMDMxMjUgODcuNzQyMTg4IDYyLjIyMjY1NiA4NS40NDUzMTIgNjYuOTk2MDk0IEwgODguODc4OTA2IDY4LjY1NjI1IEMgOTEuNDU3MDMxIDYzLjM2NzE4OCA5Mi45MTAxNTYgNTcuNTk3NjU2IDkzLjE1MjM0NCA1MS43MTg3NSBMIDEwMCA1MS43MTg3NSBaIE0gNjIuMDE5NTMxIDUxLjczNDM3NSBDIDYxLjE4MzU5NCA1Ni45NDUzMTIgNTcuMDg1OTM4IDYxLjAyMzQzOCA1MS44NzEwOTQgNjEuODI4MTI1IEwgNTEuODcxMDk0IDU3LjUxNTYyNSBMIDQ4LjA1NDY4OCA1Ny41MTU2MjUgTCA0OC4wNTQ2ODggNjEuODA4NTk0IEMgNDIuOTEwMTU2IDYwLjk0OTIxOSAzOC44ODY3MTkgNTYuOTAyMzQ0IDM4LjA1ODU5NCA1MS43NTM5MDYgTCA0Mi4zMzIwMzEgNTEuNzUzOTA2IEwgNDIuMzMyMDMxIDQ3Ljk0MTQwNiBMIDM4LjA1ODU5NCA0Ny45NDE0MDYgQyAzOC44ODY3MTkgNDIuNzg5MDYyIDQyLjkxMDE1NiAzOC43NDYwOTQgNDguMDU0Njg4IDM3Ljg4NjcxOSBMIDQ4LjA1NDY4OCA0Mi4xNzk2ODggTCA1MS44NzEwOTQgNDIuMTc5Njg4IEwgNTEuODcxMDk0IDM3Ljg0NzY1NiBDIDU3LjA3ODEyNSAzOC42NDg0MzggNjEuMTc5Njg4IDQyLjcxODc1IDYyLjAxOTUzMSA0Ny45MjE4NzUgTCA1Ny43MDcwMzEgNDcuOTIxODc1IEwgNTcuNzA3MDMxIDUxLjczNDM3NSBaIE0gNjIuMDE5NTMxIDUxLjczNDM3NSBcIi8+YDtcbmV4cG9ydCBjb25zdCBDT0xMQVBTRV9JQ09OOiBzdHJpbmcgPSBgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIiB3aWR0aD1cIjhcIiBoZWlnaHQ9XCI4XCIgY2xhc3M9XCJyaWdodC10cmlhbmdsZVwiPjxwYXRoIGZpbGw9XCJjdXJyZW50Q29sb3JcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBkPVwiTTk0LjksMjAuOGMtMS40LTIuNS00LjEtNC4xLTcuMS00LjFIMTIuMmMtMywwLTUuNywxLjYtNy4xLDQuMWMtMS4zLDIuNC0xLjIsNS4yLDAuMiw3LjZMNDMuMSw4OGMxLjUsMi4zLDQsMy43LDYuOSwzLjcgczUuNC0xLjQsNi45LTMuN2wzNy44LTU5LjZDOTYuMSwyNiw5Ni4yLDIzLjIsOTQuOSwyMC44TDk0LjksMjAuOHpcIj48L3BhdGg+PC9zdmc+YDtcbiIsImltcG9ydCB7XG4gICAgTW9kYWwsXG4gICAgQXBwLFxuICAgIE1hcmtkb3duUmVuZGVyZXIsXG4gICAgTm90aWNlLFxuICAgIFBsYXRmb3JtLFxuICAgIFRGaWxlLFxufSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIFNSUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCB7XG4gICAgQ2FyZCxcbiAgICBDYXJkVHlwZSxcbiAgICBGbGFzaGNhcmRNb2RhbE1vZGUsXG4gICAgUmV2aWV3UmVzcG9uc2UsXG4gICAgRGVjayxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcbmltcG9ydCB7IHNjaGVkdWxlLCB0ZXh0SW50ZXJ2YWwgfSBmcm9tIFwiLi9zY2hlZFwiO1xuaW1wb3J0IHsgQ0xPWkVfU0NIRURVTElOR19FWFRSQUNUT1IsIENPTExBUFNFX0lDT04gfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFNldHRpbmcgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuaW1wb3J0IHsgZXNjYXBlUmVnZXhTdHJpbmcsIGZpeERvbGxhclNpZ25zLCBjeXJiNTMgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgY2xhc3MgRmxhc2hjYXJkTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gICAgcHVibGljIHBsdWdpbjogU1JQbHVnaW47XG4gICAgcHVibGljIGFuc3dlckJ0bjogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIGZsYXNoY2FyZFZpZXc6IEhUTUxFbGVtZW50O1xuICAgIHB1YmxpYyBoYXJkQnRuOiBIVE1MRWxlbWVudDtcbiAgICBwdWJsaWMgZ29vZEJ0bjogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIGVhc3lCdG46IEhUTUxFbGVtZW50O1xuICAgIHB1YmxpYyByZXNwb25zZURpdjogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIGZpbGVMaW5rVmlldzogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIHJlc2V0TGlua1ZpZXc6IEhUTUxFbGVtZW50O1xuICAgIHB1YmxpYyBjb250ZXh0VmlldzogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIGN1cnJlbnRDYXJkOiBDYXJkO1xuICAgIHB1YmxpYyBjdXJyZW50Q2FyZElkeDogbnVtYmVyO1xuICAgIHB1YmxpYyBjdXJyZW50RGVjazogRGVjaztcbiAgICBwdWJsaWMgY2hlY2tEZWNrOiBEZWNrO1xuICAgIHB1YmxpYyBtb2RlOiBGbGFzaGNhcmRNb2RhbE1vZGU7XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBTUlBsdWdpbikge1xuICAgICAgICBzdXBlcihhcHApO1xuXG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXG4gICAgICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KFwiRGVja3NcIik7XG5cbiAgICAgICAgaWYgKFBsYXRmb3JtLmlzTW9iaWxlKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGFsRWwuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgICAgICAgICB0aGlzLm1vZGFsRWwuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIHRoaXMuY29udGVudEVsLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZ2V0U2V0dGluZyhcImxhcmdlU2NyZWVuTW9kZVwiLCB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kYWxFbC5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGFsRWwuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLmhlaWdodCA9IFwiODAlXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLndpZHRoID0gXCI0MCVcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29udGVudEVsLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuICAgICAgICB0aGlzLmNvbnRlbnRFbC5zdHlsZS5oZWlnaHQgPSBcIjkyJVwiO1xuICAgICAgICB0aGlzLmNvbnRlbnRFbC5hZGRDbGFzcyhcInNyLW1vZGFsLWNvbnRlbnRcIik7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5vbmtleXByZXNzID0gKGUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgIT0gRmxhc2hjYXJkTW9kYWxNb2RlLkRlY2tzTGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlICE9IEZsYXNoY2FyZE1vZGFsTW9kZS5DbG9zZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZS5jb2RlID09IFwiS2V5U1wiXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERlY2suZGVsZXRlRmxhc2hjYXJkQXRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENhcmRJZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLmlzRHVlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRDYXJkLmNhcmRUeXBlID09IENhcmRUeXBlLkNsb3plKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXJ5UmVsYXRlZENhcmRzKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVjay5uZXh0Q2FyZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGUgPT0gRmxhc2hjYXJkTW9kYWxNb2RlLkZyb250ICYmXG4gICAgICAgICAgICAgICAgICAgIChlLmNvZGUgPT0gXCJTcGFjZVwiIHx8IGUuY29kZSA9PSBcIkVudGVyXCIpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dBbnN3ZXIoKTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLm1vZGUgPT0gRmxhc2hjYXJkTW9kYWxNb2RlLkJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuY29kZSA9PSBcIk51bXBhZDFcIiB8fCBlLmNvZGUgPT0gXCJEaWdpdDFcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1JldmlldyhSZXZpZXdSZXNwb25zZS5IYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlLmNvZGUgPT0gXCJOdW1wYWQyXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuY29kZSA9PSBcIkRpZ2l0MlwiIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBlLmNvZGUgPT0gXCJTcGFjZVwiXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc1JldmlldyhSZXZpZXdSZXNwb25zZS5Hb29kKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZS5jb2RlID09IFwiTnVtcGFkM1wiIHx8IGUuY29kZSA9PSBcIkRpZ2l0M1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmV2aWV3KFJldmlld1Jlc3BvbnNlLkVhc3kpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChlLmNvZGUgPT0gXCJOdW1wYWQwXCIgfHwgZS5jb2RlID09IFwiRGlnaXQwXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXZpZXcoUmV2aWV3UmVzcG9uc2UuUmVzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIHRoaXMuZGVja3NMaXN0KCk7XG4gICAgfVxuXG4gICAgb25DbG9zZSgpIHtcbiAgICAgICAgdGhpcy5tb2RlID0gRmxhc2hjYXJkTW9kYWxNb2RlLkNsb3NlZDtcbiAgICB9XG5cbiAgICBkZWNrc0xpc3QoKSB7XG4gICAgICAgIHRoaXMubW9kZSA9IEZsYXNoY2FyZE1vZGFsTW9kZS5EZWNrc0xpc3Q7XG4gICAgICAgIHRoaXMudGl0bGVFbC5zZXRUZXh0KFwiRGVja3NcIik7XG4gICAgICAgIHRoaXMudGl0bGVFbC5pbm5lckhUTUwgKz1cbiAgICAgICAgICAgICc8cCBzdHlsZT1cIm1hcmdpbjowcHg7bGluZS1oZWlnaHQ6MTJweDtcIj4nICtcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IzRjYWY1MDtjb2xvcjojZmZmZmZmO1wiIGFyaWEtbGFiZWw9XCJEdWUgY2FyZHNcIiBjbGFzcz1cInRhZy1wYW5lLXRhZy1jb3VudCB0cmVlLWl0ZW0tZmxhaXJcIj4nICtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmRlY2tUcmVlLmR1ZUZsYXNoY2FyZHNDb3VudCArXG4gICAgICAgICAgICBcIjwvc3Bhbj5cIiArXG4gICAgICAgICAgICAnPHNwYW4gc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiMyMTk2ZjM7XCIgYXJpYS1sYWJlbD1cIk5ldyBjYXJkc1wiIGNsYXNzPVwidGFnLXBhbmUtdGFnLWNvdW50IHRyZWUtaXRlbS1mbGFpciBzci1kZWNrLWNvdW50c1wiPicgK1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGVja1RyZWUubmV3Rmxhc2hjYXJkc0NvdW50ICtcbiAgICAgICAgICAgIFwiPC9zcGFuPlwiICtcbiAgICAgICAgICAgICc8c3BhbiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6I2ZmNzA0MztcIiBhcmlhLWxhYmVsPVwiVG90YWwgY2FyZHNcIiBjbGFzcz1cInRhZy1wYW5lLXRhZy1jb3VudCB0cmVlLWl0ZW0tZmxhaXIgc3ItZGVjay1jb3VudHNcIj4nICtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmRlY2tUcmVlLnRvdGFsRmxhc2hjYXJkcyArXG4gICAgICAgICAgICBcIjwvc3Bhbj5cIiArXG4gICAgICAgICAgICBcIjwvcD5cIjtcbiAgICAgICAgdGhpcy5jb250ZW50RWwuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb250ZW50RWwuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJzci1mbGFzaGNhcmQtdmlld1wiKTtcblxuICAgICAgICBmb3IgKGxldCBkZWNrIG9mIHRoaXMucGx1Z2luLmRlY2tUcmVlLnN1YmRlY2tzKVxuICAgICAgICAgICAgZGVjay5yZW5kZXIodGhpcy5jb250ZW50RWwsIHRoaXMpO1xuICAgIH1cblxuICAgIHNldHVwQ2FyZHNWaWV3KCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRFbC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgICAgIHRoaXMuZmlsZUxpbmtWaWV3ID0gdGhpcy5jb250ZW50RWwuY3JlYXRlRGl2KFwic3ItbGlua1wiKTtcbiAgICAgICAgdGhpcy5maWxlTGlua1ZpZXcuc2V0VGV4dChcIk9wZW4gZmlsZVwiKTtcbiAgICAgICAgaWYgKGdldFNldHRpbmcoXCJzaG93RmlsZU5hbWVJbkZpbGVMaW5rXCIsIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MpKVxuICAgICAgICAgICAgdGhpcy5maWxlTGlua1ZpZXcuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiLCBcIk9wZW4gZmlsZVwiKTtcbiAgICAgICAgdGhpcy5maWxlTGlua1ZpZXcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChfKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYub3BlbkZpbGUoXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5ub3RlXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlc2V0TGlua1ZpZXcgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoXCJzci1saW5rXCIpO1xuICAgICAgICB0aGlzLnJlc2V0TGlua1ZpZXcuc2V0VGV4dChcIlJlc2V0IGNhcmQncyBwcm9ncmVzc1wiKTtcbiAgICAgICAgdGhpcy5yZXNldExpbmtWaWV3LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoXykgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmV2aWV3KFJldmlld1Jlc3BvbnNlLlJlc2V0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVzZXRMaW5rVmlldy5zdHlsZS5mbG9hdCA9IFwicmlnaHRcIjtcblxuICAgICAgICBpZiAoZ2V0U2V0dGluZyhcInNob3dDb250ZXh0SW5DYXJkc1wiLCB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzKSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0VmlldyA9IHRoaXMuY29udGVudEVsLmNyZWF0ZURpdigpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0Vmlldy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInNyLWNvbnRleHRcIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZsYXNoY2FyZFZpZXcgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoXCJkaXZcIik7XG4gICAgICAgIHRoaXMuZmxhc2hjYXJkVmlldy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInNyLWZsYXNoY2FyZC12aWV3XCIpO1xuXG4gICAgICAgIHRoaXMucmVzcG9uc2VEaXYgPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoXCJzci1yZXNwb25zZVwiKTtcblxuICAgICAgICB0aGlzLmhhcmRCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICB0aGlzLmhhcmRCdG4uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJzci1oYXJkLWJ0blwiKTtcbiAgICAgICAgdGhpcy5oYXJkQnRuLnNldFRleHQoXCJIYXJkXCIpO1xuICAgICAgICB0aGlzLmhhcmRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChfKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NSZXZpZXcoUmV2aWV3UmVzcG9uc2UuSGFyZCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlc3BvbnNlRGl2LmFwcGVuZENoaWxkKHRoaXMuaGFyZEJ0bik7XG5cbiAgICAgICAgdGhpcy5nb29kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgdGhpcy5nb29kQnRuLnNldEF0dHJpYnV0ZShcImlkXCIsIFwic3ItZ29vZC1idG5cIik7XG4gICAgICAgIHRoaXMuZ29vZEJ0bi5zZXRUZXh0KFwiR29vZFwiKTtcbiAgICAgICAgdGhpcy5nb29kQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoXykgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzUmV2aWV3KFJldmlld1Jlc3BvbnNlLkdvb2QpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZXNwb25zZURpdi5hcHBlbmRDaGlsZCh0aGlzLmdvb2RCdG4pO1xuXG4gICAgICAgIHRoaXMuZWFzeUJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIHRoaXMuZWFzeUJ0bi5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcInNyLWVhc3ktYnRuXCIpO1xuICAgICAgICB0aGlzLmVhc3lCdG4uc2V0VGV4dChcIkVhc3lcIik7XG4gICAgICAgIHRoaXMuZWFzeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKF8pID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1JldmlldyhSZXZpZXdSZXNwb25zZS5FYXN5KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVzcG9uc2VEaXYuYXBwZW5kQ2hpbGQodGhpcy5lYXN5QnRuKTtcbiAgICAgICAgdGhpcy5yZXNwb25zZURpdi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgICAgdGhpcy5hbnN3ZXJCdG4gPSB0aGlzLmNvbnRlbnRFbC5jcmVhdGVEaXYoKTtcbiAgICAgICAgdGhpcy5hbnN3ZXJCdG4uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJzci1zaG93LWFuc3dlclwiKTtcbiAgICAgICAgdGhpcy5hbnN3ZXJCdG4uc2V0VGV4dChcIlNob3cgQW5zd2VyXCIpO1xuICAgICAgICB0aGlzLmFuc3dlckJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKF8pID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Fuc3dlcigpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzaG93QW5zd2VyKCkge1xuICAgICAgICB0aGlzLm1vZGUgPSBGbGFzaGNhcmRNb2RhbE1vZGUuQmFjaztcblxuICAgICAgICB0aGlzLmFuc3dlckJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHRoaXMucmVzcG9uc2VEaXYuc3R5bGUuZGlzcGxheSA9IFwiZ3JpZFwiO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRDYXJkLmlzRHVlKVxuICAgICAgICAgICAgdGhpcy5yZXNldExpbmtWaWV3LnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRDYXJkLmNhcmRUeXBlICE9IENhcmRUeXBlLkNsb3plKSB7XG4gICAgICAgICAgICBsZXQgaHI6IEhUTUxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImhyXCIpO1xuICAgICAgICAgICAgaHIuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJzci1oci1jYXJkLWRpdmlkZVwiKTtcbiAgICAgICAgICAgIHRoaXMuZmxhc2hjYXJkVmlldy5hcHBlbmRDaGlsZChocik7XG4gICAgICAgIH0gZWxzZSB0aGlzLmZsYXNoY2FyZFZpZXcuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgICAgICB0aGlzLnJlbmRlck1hcmtkb3duV3JhcHBlcih0aGlzLmN1cnJlbnRDYXJkLmJhY2ssIHRoaXMuZmxhc2hjYXJkVmlldyk7XG4gICAgfVxuXG4gICAgYXN5bmMgcHJvY2Vzc1JldmlldyhyZXNwb25zZTogUmV2aWV3UmVzcG9uc2UpIHtcbiAgICAgICAgbGV0IGludGVydmFsLCBlYXNlLCBkdWU7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50RGVjay5kZWxldGVGbGFzaGNhcmRBdEluZGV4KHRoaXMuY3VycmVudENhcmRJZHgsIHRoaXMuY3VycmVudENhcmQuaXNEdWUpO1xuICAgICAgICBpZiAocmVzcG9uc2UgIT0gUmV2aWV3UmVzcG9uc2UuUmVzZXQpIHtcbiAgICAgICAgICAgIC8vIHNjaGVkdWxlZCBjYXJkXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50Q2FyZC5pc0R1ZSkge1xuICAgICAgICAgICAgICAgIGxldCBzY2hlZE9iaiA9IHNjaGVkdWxlKFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5pbnRlcnZhbCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5lYXNlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLmRlbGF5QmVmb3JlUmV2aWV3LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kdWVEYXRlc0ZsYXNoY2FyZHNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gc2NoZWRPYmouaW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgZWFzZSA9IHNjaGVkT2JqLmVhc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzY2hlZE9iaiA9IHNjaGVkdWxlKFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcImJhc2VFYXNlXCIsIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3MpLFxuICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kdWVEYXRlc0ZsYXNoY2FyZHNcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gc2NoZWRPYmouaW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgZWFzZSA9IHNjaGVkT2JqLmVhc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGR1ZSA9IHdpbmRvdy5tb21lbnQoRGF0ZS5ub3coKSArIGludGVydmFsICogMjQgKiAzNjAwICogMTAwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLmludGVydmFsID0gMS4wO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5lYXNlID0gdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5ncy5iYXNlRWFzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRDYXJkLmlzRHVlKVxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERlY2suZHVlRmxhc2hjYXJkcy5wdXNoKHRoaXMuY3VycmVudENhcmQpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLmN1cnJlbnREZWNrLm5ld0ZsYXNoY2FyZHMucHVzaCh0aGlzLmN1cnJlbnRDYXJkKTtcbiAgICAgICAgICAgIGR1ZSA9IHdpbmRvdy5tb21lbnQoRGF0ZS5ub3coKSk7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiQ2FyZCdzIHByb2dyZXNzIGhhcyBiZWVuIHJlc2V0XCIpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVjay5uZXh0Q2FyZCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkdWVTdHJpbmc6IHN0cmluZyA9IGR1ZS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuXG4gICAgICAgIGxldCBmaWxlVGV4dDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZCh0aGlzLmN1cnJlbnRDYXJkLm5vdGUpO1xuICAgICAgICBsZXQgcmVwbGFjZW1lbnRSZWdleCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICBlc2NhcGVSZWdleFN0cmluZyh0aGlzLmN1cnJlbnRDYXJkLmNhcmRUZXh0KSxcbiAgICAgICAgICAgIFwiZ21cIlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBzZXA6IHN0cmluZyA9IGdldFNldHRpbmcoXG4gICAgICAgICAgICBcImNhcmRDb21tZW50T25TYW1lTGluZVwiLFxuICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICApXG4gICAgICAgICAgICA/IFwiIFwiXG4gICAgICAgICAgICA6IFwiXFxuXCI7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudENhcmQuY2FyZFR5cGUgPT0gQ2FyZFR5cGUuQ2xvemUpIHtcbiAgICAgICAgICAgIGxldCBzY2hlZElkeDogbnVtYmVyID1cbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLmNhcmRUZXh0Lmxhc3RJbmRleE9mKFwiPCEtLVNSOlwiKTtcbiAgICAgICAgICAgIGlmIChzY2hlZElkeCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGZpcnN0IHRpbWUgYWRkaW5nIHNjaGVkdWxpbmcgaW5mb3JtYXRpb24gdG8gZmxhc2hjYXJkXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5jYXJkVGV4dCA9IGAke3RoaXMuY3VycmVudENhcmQuY2FyZFRleHR9JHtzZXB9PCEtLVNSOiEke2R1ZVN0cmluZ30sJHtpbnRlcnZhbH0sJHtlYXNlfS0tPmA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzY2hlZHVsaW5nOiBSZWdFeHBNYXRjaEFycmF5W10gPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMuY3VycmVudENhcmQuY2FyZFRleHQubWF0Y2hBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICBDTE9aRV9TQ0hFRFVMSU5HX0VYVFJBQ1RPUlxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBsZXQgZGVsZXRpb25TY2hlZDogc3RyaW5nW10gPSBbXG4gICAgICAgICAgICAgICAgICAgIFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICBkdWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGAke2ludGVydmFsfWAsXG4gICAgICAgICAgICAgICAgICAgIGAke2Vhc2V9YCxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRDYXJkLmlzRHVlKVxuICAgICAgICAgICAgICAgICAgICBzY2hlZHVsaW5nW3RoaXMuY3VycmVudENhcmQuc3ViQ2FyZElkeF0gPSBkZWxldGlvblNjaGVkO1xuICAgICAgICAgICAgICAgIGVsc2Ugc2NoZWR1bGluZy5wdXNoKGRlbGV0aW9uU2NoZWQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5jYXJkVGV4dCA9IHRoaXMuY3VycmVudENhcmQuY2FyZFRleHQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLzwhLS1TUjouKy0tPi9nbSxcbiAgICAgICAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5jYXJkVGV4dCArPSBcIjwhLS1TUjpcIjtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjaGVkdWxpbmcubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENhcmQuY2FyZFRleHQgKz0gYCEke3NjaGVkdWxpbmdbaV1bMV19LCR7c2NoZWR1bGluZ1tpXVsyXX0sJHtzY2hlZHVsaW5nW2ldWzNdfWA7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5jYXJkVGV4dCArPSBcIi0tPlwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaWxlVGV4dCA9IGZpbGVUZXh0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRSZWdleCxcbiAgICAgICAgICAgICAgICBmaXhEb2xsYXJTaWducyh0aGlzLmN1cnJlbnRDYXJkLmNhcmRUZXh0KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGZvciAobGV0IHJlbGF0ZWRDYXJkIG9mIHRoaXMuY3VycmVudENhcmQucmVsYXRlZENhcmRzKVxuICAgICAgICAgICAgICAgIHJlbGF0ZWRDYXJkLmNhcmRUZXh0ID0gdGhpcy5jdXJyZW50Q2FyZC5jYXJkVGV4dDtcbiAgICAgICAgICAgIGlmICh0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzLmJ1cnlSZWxhdGVkQ2FyZHMpXG4gICAgICAgICAgICAgICAgdGhpcy5idXJ5UmVsYXRlZENhcmRzKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudENhcmQuY2FyZFR5cGUgPT0gQ2FyZFR5cGUuU2luZ2xlTGluZUJhc2ljKSB7XG4gICAgICAgICAgICAgICAgZmlsZVRleHQgPSBmaWxlVGV4dC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudFJlZ2V4LFxuICAgICAgICAgICAgICAgICAgICBgJHtmaXhEb2xsYXJTaWducyh0aGlzLmN1cnJlbnRDYXJkLmZyb250KX0ke2dldFNldHRpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICBcInNpbmdsZWxpbmVDYXJkU2VwYXJhdG9yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICAgICAgICAgICAgICl9JHtmaXhEb2xsYXJTaWducyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudENhcmQuYmFja1xuICAgICAgICAgICAgICAgICAgICApfSR7c2VwfTwhLS1TUjoke2R1ZVN0cmluZ30sJHtpbnRlcnZhbH0sJHtlYXNlfS0tPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWxlVGV4dCA9IGZpbGVUZXh0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50UmVnZXgsXG4gICAgICAgICAgICAgICAgICAgIGAke2ZpeERvbGxhclNpZ25zKHRoaXMuY3VycmVudENhcmQuZnJvbnQpfVxcbiR7Z2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibXVsdGlsaW5lQ2FyZFNlcGFyYXRvclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICApfVxcbiR7Zml4RG9sbGFyU2lnbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLmJhY2tcbiAgICAgICAgICAgICAgICAgICAgKX0ke3NlcH08IS0tU1I6JHtkdWVTdHJpbmd9LCR7aW50ZXJ2YWx9LCR7ZWFzZX0tLT5gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeSh0aGlzLmN1cnJlbnRDYXJkLm5vdGUsIGZpbGVUZXh0KTtcbiAgICAgICAgdGhpcy5jdXJyZW50RGVjay5uZXh0Q2FyZCh0aGlzKTtcbiAgICB9XG5cbiAgICBhc3luYyBidXJ5UmVsYXRlZENhcmRzKHRpbGxOZXh0RGF5OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aWxsTmV4dERheSkge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uZGF0YS5idXJ5TGlzdC5wdXNoKGN5cmI1Myh0aGlzLmN1cnJlbnRDYXJkLmNhcmRUZXh0KSk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlUGx1Z2luRGF0YSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZENhcmQgb2YgdGhpcy5jdXJyZW50Q2FyZC5yZWxhdGVkQ2FyZHMpIHtcbiAgICAgICAgICAgIGxldCBkdWVJZHggPSB0aGlzLmN1cnJlbnREZWNrLmR1ZUZsYXNoY2FyZHMuaW5kZXhPZihyZWxhdGVkQ2FyZCk7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyZW50RGVjay5uZXdGbGFzaGNhcmRzLmluZGV4T2YocmVsYXRlZENhcmQpO1xuXG4gICAgICAgICAgICBpZiAoZHVlSWR4ICE9IC0xKVxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERlY2suZGVsZXRlRmxhc2hjYXJkQXRJbmRleChcbiAgICAgICAgICAgICAgICAgICAgZHVlSWR4LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREZWNrLmR1ZUZsYXNoY2FyZHNbZHVlSWR4XS5pc0R1ZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBlbHNlIGlmIChuZXdJZHggIT0gLTEpXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVjay5kZWxldGVGbGFzaGNhcmRBdEluZGV4KFxuICAgICAgICAgICAgICAgICAgICBuZXdJZHgsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERlY2submV3Rmxhc2hjYXJkc1tuZXdJZHhdLmlzRHVlXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNsaWdodGx5IG1vZGlmaWVkIHZlcnNpb24gb2YgdGhlIHJlbmRlck1hcmtkb3duIGZ1bmN0aW9uIGluXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21nbWV5ZXJzL29ic2lkaWFuLWthbmJhbi9ibG9iL21haW4vc3JjL0thbmJhblZpZXcudHN4XG4gICAgYXN5bmMgcmVuZGVyTWFya2Rvd25XcmFwcGVyKFxuICAgICAgICBtYXJrZG93blN0cmluZzogc3RyaW5nLFxuICAgICAgICBjb250YWluZXJFbDogSFRNTEVsZW1lbnRcbiAgICApIHtcbiAgICAgICAgTWFya2Rvd25SZW5kZXJlci5yZW5kZXJNYXJrZG93bihcbiAgICAgICAgICAgIG1hcmtkb3duU3RyaW5nLFxuICAgICAgICAgICAgY29udGFpbmVyRWwsXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRDYXJkLm5vdGUucGF0aCxcbiAgICAgICAgICAgIG51bGxcbiAgICAgICAgKTtcbiAgICAgICAgY29udGFpbmVyRWwuZmluZEFsbChcIi5pbnRlcm5hbC1lbWJlZFwiKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3JjID0gZWwuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgICAgICAgICAgICB0eXBlb2Ygc3JjID09PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0Rmlyc3RMaW5rcGF0aERlc3QoXG4gICAgICAgICAgICAgICAgICAgIHNyYyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q2FyZC5ub3RlLnBhdGhcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIFRGaWxlICYmIHRhcmdldC5leHRlbnNpb24gIT09IFwibWRcIikge1xuICAgICAgICAgICAgICAgIGVsLmlubmVyVGV4dCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZWwuY3JlYXRlRWwoXG4gICAgICAgICAgICAgICAgICAgIFwiaW1nXCIsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRSZXNvdXJjZVBhdGgodGFyZ2V0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIChpbWcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoXCJ3aWR0aFwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgZWwuZ2V0QXR0cmlidXRlKFwid2lkdGhcIikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpbWcuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgXCIxMDAlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsLmhhc0F0dHJpYnV0ZShcImFsdFwiKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKFwiYWx0XCIsIGVsLmdldEF0dHJpYnV0ZShcImFsdFwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGVsLmFkZENsYXNzZXMoW1wiaW1hZ2UtZW1iZWRcIiwgXCJpcy1sb2FkZWRcIl0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmaWxlIGRvZXMgbm90IGV4aXN0XG4gICAgICAgICAgICAvLyBkaXNwbGF5IGRlYWQgbGlua1xuICAgICAgICAgICAgaWYgKHRhcmdldCA9PSBudWxsKSBlbC5pbm5lclRleHQgPSBzcmM7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuRGVjay5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKFxuICAgIGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCxcbiAgICBtb2RhbDogRmxhc2hjYXJkTW9kYWxcbik6IHZvaWQge1xuICAgIGxldCBkZWNrVmlldzogSFRNTEVsZW1lbnQgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoXCJ0cmVlLWl0ZW1cIik7XG5cbiAgICBsZXQgZGVja1ZpZXdTZWxmOiBIVE1MRWxlbWVudCA9IGRlY2tWaWV3LmNyZWF0ZURpdihcbiAgICAgICAgXCJ0cmVlLWl0ZW0tc2VsZiB0YWctcGFuZS10YWcgaXMtY2xpY2thYmxlXCJcbiAgICApO1xuICAgIGxldCBjb2xsYXBzZWQ6IGJvb2xlYW4gPSB0cnVlO1xuICAgIGxldCBjb2xsYXBzZUljb25FbDogSFRNTEVsZW1lbnQgPSBkZWNrVmlld1NlbGYuY3JlYXRlRGl2KFxuICAgICAgICBcInRyZWUtaXRlbS1pY29uIGNvbGxhcHNlLWljb25cIlxuICAgICk7XG4gICAgY29sbGFwc2VJY29uRWwuaW5uZXJIVE1MID0gQ09MTEFQU0VfSUNPTjtcbiAgICAoY29sbGFwc2VJY29uRWwuY2hpbGROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCkuc3R5bGUudHJhbnNmb3JtID1cbiAgICAgICAgXCJyb3RhdGUoLTkwZGVnKVwiO1xuXG4gICAgbGV0IGRlY2tWaWV3SW5uZXI6IEhUTUxFbGVtZW50ID0gZGVja1ZpZXdTZWxmLmNyZWF0ZURpdihcInRyZWUtaXRlbS1pbm5lclwiKTtcbiAgICBkZWNrVmlld0lubmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoXykgPT4ge1xuICAgICAgICBtb2RhbC5jdXJyZW50RGVjayA9IHRoaXM7XG4gICAgICAgIG1vZGFsLmNoZWNrRGVjayA9IHRoaXMucGFyZW50O1xuICAgICAgICBtb2RhbC5zZXR1cENhcmRzVmlldygpO1xuICAgICAgICB0aGlzLm5leHRDYXJkKG1vZGFsKTtcbiAgICB9KTtcbiAgICBsZXQgZGVja1ZpZXdJbm5lclRleHQ6IEhUTUxFbGVtZW50ID1cbiAgICAgICAgZGVja1ZpZXdJbm5lci5jcmVhdGVEaXYoXCJ0YWctcGFuZS10YWctdGV4dFwiKTtcbiAgICBkZWNrVmlld0lubmVyVGV4dC5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPVwidGFnLXBhbmUtdGFnLXNlbGZcIj4ke3RoaXMuZGVja05hbWV9PC9zcGFuPmA7XG4gICAgbGV0IGRlY2tWaWV3T3V0ZXI6IEhUTUxFbGVtZW50ID0gZGVja1ZpZXdTZWxmLmNyZWF0ZURpdihcbiAgICAgICAgXCJ0cmVlLWl0ZW0tZmxhaXItb3V0ZXJcIlxuICAgICk7XG4gICAgZGVja1ZpZXdPdXRlci5pbm5lckhUTUwgKz1cbiAgICAgICAgJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjojNGNhZjUwO1wiIGNsYXNzPVwidGFnLXBhbmUtdGFnLWNvdW50IHRyZWUtaXRlbS1mbGFpciBzci1kZWNrLWNvdW50c1wiPicgK1xuICAgICAgICB0aGlzLmR1ZUZsYXNoY2FyZHNDb3VudCArXG4gICAgICAgIFwiPC9zcGFuPlwiICtcbiAgICAgICAgJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjojMjE5NmYzO1wiIGNsYXNzPVwidGFnLXBhbmUtdGFnLWNvdW50IHRyZWUtaXRlbS1mbGFpciBzci1kZWNrLWNvdW50c1wiPicgK1xuICAgICAgICB0aGlzLm5ld0ZsYXNoY2FyZHNDb3VudCArXG4gICAgICAgIFwiPC9zcGFuPlwiICtcbiAgICAgICAgJzxzcGFuIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjojZmY3MDQzO1wiIGNsYXNzPVwidGFnLXBhbmUtdGFnLWNvdW50IHRyZWUtaXRlbS1mbGFpciBzci1kZWNrLWNvdW50c1wiPicgK1xuICAgICAgICB0aGlzLnRvdGFsRmxhc2hjYXJkcyArXG4gICAgICAgIFwiPC9zcGFuPlwiO1xuXG4gICAgbGV0IGRlY2tWaWV3Q2hpbGRyZW46IEhUTUxFbGVtZW50ID1cbiAgICAgICAgZGVja1ZpZXcuY3JlYXRlRGl2KFwidHJlZS1pdGVtLWNoaWxkcmVuXCIpO1xuICAgIGRlY2tWaWV3Q2hpbGRyZW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGNvbGxhcHNlSWNvbkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoXykgPT4ge1xuICAgICAgICBpZiAoY29sbGFwc2VkKSB7XG4gICAgICAgICAgICAoY29sbGFwc2VJY29uRWwuY2hpbGROb2Rlc1swXSBhcyBIVE1MRWxlbWVudCkuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgICAgIGRlY2tWaWV3Q2hpbGRyZW4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIChjb2xsYXBzZUljb25FbC5jaGlsZE5vZGVzWzBdIGFzIEhUTUxFbGVtZW50KS5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICAgICAgICAgICAgIFwicm90YXRlKC05MGRlZylcIjtcbiAgICAgICAgICAgIGRlY2tWaWV3Q2hpbGRyZW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbGxhcHNlZCA9ICFjb2xsYXBzZWQ7XG4gICAgfSk7XG4gICAgZm9yIChsZXQgZGVjayBvZiB0aGlzLnN1YmRlY2tzKSBkZWNrLnJlbmRlcihkZWNrVmlld0NoaWxkcmVuLCBtb2RhbCk7XG59O1xuXG5EZWNrLnByb3RvdHlwZS5uZXh0Q2FyZCA9IGZ1bmN0aW9uIChtb2RhbDogRmxhc2hjYXJkTW9kYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5uZXdGbGFzaGNhcmRzLmxlbmd0aCArIHRoaXMuZHVlRmxhc2hjYXJkcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBpZiAodGhpcy5kdWVGbGFzaGNhcmRzQ291bnQgKyB0aGlzLm5ld0ZsYXNoY2FyZHNDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IGRlY2sgb2YgdGhpcy5zdWJkZWNrcykge1xuICAgICAgICAgICAgICAgIGlmIChkZWNrLmR1ZUZsYXNoY2FyZHNDb3VudCArIGRlY2submV3Rmxhc2hjYXJkc0NvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbC5jdXJyZW50RGVjayA9IGRlY2s7XG4gICAgICAgICAgICAgICAgICAgIGRlY2submV4dENhcmQobW9kYWwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyZW50ID09IG1vZGFsLmNoZWNrRGVjaykgbW9kYWwuZGVja3NMaXN0KCk7XG4gICAgICAgIGVsc2UgdGhpcy5wYXJlbnQubmV4dENhcmQobW9kYWwpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbW9kYWwucmVzcG9uc2VEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG1vZGFsLnJlc2V0TGlua1ZpZXcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIG1vZGFsLnRpdGxlRWwuc2V0VGV4dChcbiAgICAgICAgYCR7dGhpcy5kZWNrTmFtZX0gLSAke1xuICAgICAgICAgICAgdGhpcy5kdWVGbGFzaGNhcmRzQ291bnQgKyB0aGlzLm5ld0ZsYXNoY2FyZHNDb3VudFxuICAgICAgICB9YFxuICAgICk7XG5cbiAgICBtb2RhbC5hbnN3ZXJCdG4uc3R5bGUuZGlzcGxheSA9IFwiaW5pdGlhbFwiO1xuICAgIG1vZGFsLmZsYXNoY2FyZFZpZXcuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBtb2RhbC5tb2RlID0gRmxhc2hjYXJkTW9kYWxNb2RlLkZyb250O1xuXG4gICAgaWYgKHRoaXMuZHVlRmxhc2hjYXJkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChnZXRTZXR0aW5nKFwicmFuZG9taXplQ2FyZE9yZGVyXCIsIG1vZGFsLnBsdWdpbi5kYXRhLnNldHRpbmdzKSlcbiAgICAgICAgICAgIG1vZGFsLmN1cnJlbnRDYXJkSWR4ID0gTWF0aC5mbG9vcihcbiAgICAgICAgICAgICAgICBNYXRoLnJhbmRvbSgpICogdGhpcy5kdWVGbGFzaGNhcmRzLmxlbmd0aFxuICAgICAgICAgICAgKTtcbiAgICAgICAgZWxzZSBtb2RhbC5jdXJyZW50Q2FyZElkeCA9IDA7XG4gICAgICAgIG1vZGFsLmN1cnJlbnRDYXJkID0gdGhpcy5kdWVGbGFzaGNhcmRzW21vZGFsLmN1cnJlbnRDYXJkSWR4XTtcbiAgICAgICAgbW9kYWwucmVuZGVyTWFya2Rvd25XcmFwcGVyKFxuICAgICAgICAgICAgbW9kYWwuY3VycmVudENhcmQuZnJvbnQsXG4gICAgICAgICAgICBtb2RhbC5mbGFzaGNhcmRWaWV3XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGhhcmRJbnRlcnZhbDogbnVtYmVyID0gc2NoZWR1bGUoXG4gICAgICAgICAgICBSZXZpZXdSZXNwb25zZS5IYXJkLFxuICAgICAgICAgICAgbW9kYWwuY3VycmVudENhcmQuaW50ZXJ2YWwsXG4gICAgICAgICAgICBtb2RhbC5jdXJyZW50Q2FyZC5lYXNlLFxuICAgICAgICAgICAgbW9kYWwuY3VycmVudENhcmQuZGVsYXlCZWZvcmVSZXZpZXcsXG4gICAgICAgICAgICBtb2RhbC5wbHVnaW4uZGF0YS5zZXR0aW5nc1xuICAgICAgICApLmludGVydmFsO1xuICAgICAgICBsZXQgZ29vZEludGVydmFsOiBudW1iZXIgPSBzY2hlZHVsZShcbiAgICAgICAgICAgIFJldmlld1Jlc3BvbnNlLkdvb2QsXG4gICAgICAgICAgICBtb2RhbC5jdXJyZW50Q2FyZC5pbnRlcnZhbCxcbiAgICAgICAgICAgIG1vZGFsLmN1cnJlbnRDYXJkLmVhc2UsXG4gICAgICAgICAgICBtb2RhbC5jdXJyZW50Q2FyZC5kZWxheUJlZm9yZVJldmlldyxcbiAgICAgICAgICAgIG1vZGFsLnBsdWdpbi5kYXRhLnNldHRpbmdzXG4gICAgICAgICkuaW50ZXJ2YWw7XG4gICAgICAgIGxldCBlYXN5SW50ZXJ2YWw6IG51bWJlciA9IHNjaGVkdWxlKFxuICAgICAgICAgICAgUmV2aWV3UmVzcG9uc2UuRWFzeSxcbiAgICAgICAgICAgIG1vZGFsLmN1cnJlbnRDYXJkLmludGVydmFsLFxuICAgICAgICAgICAgbW9kYWwuY3VycmVudENhcmQuZWFzZSxcbiAgICAgICAgICAgIG1vZGFsLmN1cnJlbnRDYXJkLmRlbGF5QmVmb3JlUmV2aWV3LFxuICAgICAgICAgICAgbW9kYWwucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgKS5pbnRlcnZhbDtcblxuICAgICAgICBpZiAoUGxhdGZvcm0uaXNNb2JpbGUpIHtcbiAgICAgICAgICAgIG1vZGFsLmhhcmRCdG4uc2V0VGV4dCh0ZXh0SW50ZXJ2YWwoaGFyZEludGVydmFsLCB0cnVlKSk7XG4gICAgICAgICAgICBtb2RhbC5nb29kQnRuLnNldFRleHQodGV4dEludGVydmFsKGdvb2RJbnRlcnZhbCwgdHJ1ZSkpO1xuICAgICAgICAgICAgbW9kYWwuZWFzeUJ0bi5zZXRUZXh0KHRleHRJbnRlcnZhbChlYXN5SW50ZXJ2YWwsIHRydWUpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZGFsLmhhcmRCdG4uc2V0VGV4dChcbiAgICAgICAgICAgICAgICBgSGFyZCAtICR7dGV4dEludGVydmFsKGhhcmRJbnRlcnZhbCwgZmFsc2UpfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBtb2RhbC5nb29kQnRuLnNldFRleHQoXG4gICAgICAgICAgICAgICAgYEdvb2QgLSAke3RleHRJbnRlcnZhbChnb29kSW50ZXJ2YWwsIGZhbHNlKX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbW9kYWwuZWFzeUJ0bi5zZXRUZXh0KFxuICAgICAgICAgICAgICAgIGBFYXN5IC0gJHt0ZXh0SW50ZXJ2YWwoZWFzeUludGVydmFsLCBmYWxzZSl9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5uZXdGbGFzaGNhcmRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGdldFNldHRpbmcoXCJyYW5kb21pemVDYXJkT3JkZXJcIiwgbW9kYWwucGx1Z2luLmRhdGEuc2V0dGluZ3MpKVxuICAgICAgICAgICAgbW9kYWwuY3VycmVudENhcmRJZHggPSBNYXRoLmZsb29yKFxuICAgICAgICAgICAgICAgIE1hdGgucmFuZG9tKCkgKiB0aGlzLm5ld0ZsYXNoY2FyZHMubGVuZ3RoXG4gICAgICAgICAgICApO1xuICAgICAgICBlbHNlIG1vZGFsLmN1cnJlbnRDYXJkSWR4ID0gMDtcbiAgICAgICAgbW9kYWwuY3VycmVudENhcmQgPSB0aGlzLm5ld0ZsYXNoY2FyZHNbbW9kYWwuY3VycmVudENhcmRJZHhdO1xuICAgICAgICBtb2RhbC5yZW5kZXJNYXJrZG93bldyYXBwZXIoXG4gICAgICAgICAgICBtb2RhbC5jdXJyZW50Q2FyZC5mcm9udCxcbiAgICAgICAgICAgIG1vZGFsLmZsYXNoY2FyZFZpZXdcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoUGxhdGZvcm0uaXNNb2JpbGUpIHtcbiAgICAgICAgICAgIG1vZGFsLmhhcmRCdG4uc2V0VGV4dChcIjEuMGRcIik7XG4gICAgICAgICAgICBtb2RhbC5nb29kQnRuLnNldFRleHQoXCIyLjVkXCIpO1xuICAgICAgICAgICAgbW9kYWwuZWFzeUJ0bi5zZXRUZXh0KFwiMy41ZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vZGFsLmhhcmRCdG4uc2V0VGV4dChcIkhhcmQgLSAxLjAgZGF5XCIpO1xuICAgICAgICAgICAgbW9kYWwuZ29vZEJ0bi5zZXRUZXh0KFwiR29vZCAtIDIuNSBkYXlzXCIpO1xuICAgICAgICAgICAgbW9kYWwuZWFzeUJ0bi5zZXRUZXh0KFwiRWFzeSAtIDMuNSBkYXlzXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGdldFNldHRpbmcoXCJzaG93Q29udGV4dEluQ2FyZHNcIiwgbW9kYWwucGx1Z2luLmRhdGEuc2V0dGluZ3MpKVxuICAgICAgICBtb2RhbC5jb250ZXh0Vmlldy5zZXRUZXh0KG1vZGFsLmN1cnJlbnRDYXJkLmNvbnRleHQpO1xuICAgIGlmIChnZXRTZXR0aW5nKFwic2hvd0ZpbGVOYW1lSW5GaWxlTGlua1wiLCBtb2RhbC5wbHVnaW4uZGF0YS5zZXR0aW5ncykpXG4gICAgICAgIG1vZGFsLmZpbGVMaW5rVmlldy5zZXRUZXh0KG1vZGFsLmN1cnJlbnRDYXJkLm5vdGUuYmFzZW5hbWUpO1xufTtcbiIsImltcG9ydCB7IE1vZGFsLCBBcHAsIE1hcmtkb3duUmVuZGVyZXIsIE5vdGljZSwgUGxhdGZvcm0gfSBmcm9tIFwib2JzaWRpYW5cIjtcblxuZXhwb3J0IGNsYXNzIFN0YXRzTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gICAgcHJpdmF0ZSBkdWVEYXRlc0ZsYXNoY2FyZHM6IFJlY29yZDxudW1iZXIsIG51bWJlcj47XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgZHVlRGF0ZXNGbGFzaGNhcmRzOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+KSB7XG4gICAgICAgIHN1cGVyKGFwcCk7XG5cbiAgICAgICAgdGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHMgPSBkdWVEYXRlc0ZsYXNoY2FyZHM7XG5cbiAgICAgICAgdGhpcy50aXRsZUVsLnNldFRleHQoXCJTdGF0aXN0aWNzXCIpO1xuXG4gICAgICAgIGlmIChQbGF0Zm9ybS5pc01vYmlsZSkge1xuICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRFbC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgdGhpcy5tb2RhbEVsLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk9wZW4oKSB7XG4gICAgICAgIGxldCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblxuICAgICAgICBjb250ZW50RWwuaW5uZXJIVE1MICs9XG4gICAgICAgICAgICBcIjxkaXYgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyJz5cIiArXG4gICAgICAgICAgICBcIjxzcGFuPk5vdGUgdGhhdCB0aGlzIHJlcXVpcmVzIHRoZSBPYnNpZGlhbiBDaGFydHMgcGx1Z2luIHRvIHdvcms8L3NwYW4+XCIgK1xuICAgICAgICAgICAgXCI8aDIgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyJz5Gb3JlY2FzdDwvaDI+XCIgK1xuICAgICAgICAgICAgXCI8aDQgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyJz5UaGUgbnVtYmVyIG9mIGNhcmRzIGR1ZSBpbiB0aGUgZnV0dXJlPC9oND5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiO1xuXG4gICAgICAgIGxldCB0ZXh0ID1cbiAgICAgICAgICAgIFwiYGBgY2hhcnRcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHR5cGU6IGJhclxcblwiICtcbiAgICAgICAgICAgIGBcXHRsYWJlbHM6IFske09iamVjdC5rZXlzKHRoaXMuZHVlRGF0ZXNGbGFzaGNhcmRzKX1dXFxuYCArXG4gICAgICAgICAgICBcIlxcdHNlcmllczpcXG5cIiArXG4gICAgICAgICAgICBcIlxcdFxcdC0gdGl0bGU6IFNjaGVkdWxlZFxcblwiICtcbiAgICAgICAgICAgIGBcXHRcXHQgIGRhdGE6IFske09iamVjdC52YWx1ZXModGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHMpfV1cXG5gICtcbiAgICAgICAgICAgICdcXHR4VGl0bGU6IFwiRGF5c1wiXFxuJyArXG4gICAgICAgICAgICAnXFx0eVRpdGxlOiBcIk51bWJlciBvZiBjYXJkc1wiXFxuJyArXG4gICAgICAgICAgICBcIlxcdGxlZ2VuZDogZmFsc2VcXG5cIiArXG4gICAgICAgICAgICBcIlxcdHN0YWNrZWQ6IHRydWVcXG5cIiArXG4gICAgICAgICAgICBcImBgYGBcIjtcblxuICAgICAgICBNYXJrZG93blJlbmRlcmVyLnJlbmRlck1hcmtkb3duKHRleHQsIGNvbnRlbnRFbCwgbnVsbCwgbnVsbCk7XG4gICAgfVxuXG4gICAgb25DbG9zZSgpIHtcbiAgICAgICAgbGV0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuICAgICAgICBjb250ZW50RWwuZW1wdHkoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgTWVudSwgVEZpbGUgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB0eXBlIFNSUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCB7IENPTExBUFNFX0lDT04gfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGdldFNldHRpbmcgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuXG5leHBvcnQgY29uc3QgUkVWSUVXX1FVRVVFX1ZJRVdfVFlQRSA9IFwicmV2aWV3LXF1ZXVlLWxpc3Qtdmlld1wiO1xuXG5leHBvcnQgY2xhc3MgUmV2aWV3UXVldWVMaXN0VmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgICBwcml2YXRlIHBsdWdpbjogU1JQbHVnaW47XG4gICAgcHJpdmF0ZSBhY3RpdmVGb2xkZXJzOiBTZXQ8c3RyaW5nPjtcblxuICAgIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHBsdWdpbjogU1JQbHVnaW4pIHtcbiAgICAgICAgc3VwZXIobGVhZik7XG5cbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgIHRoaXMuYWN0aXZlRm9sZGVycyA9IG5ldyBTZXQoW1wiVG9kYXlcIl0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXG4gICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJmaWxlLW9wZW5cIiwgKF86IGFueSkgPT4gdGhpcy5yZWRyYXcoKSlcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgICAgICAgdGhpcy5hcHAudmF1bHQub24oXCJyZW5hbWVcIiwgKF86IGFueSkgPT4gdGhpcy5yZWRyYXcoKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFJFVklFV19RVUVVRV9WSUVXX1RZUEU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcIk5vdGVzIFJldmlldyBRdWV1ZVwiO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcImNyb3NzaGFpcnNcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25IZWFkZXJNZW51KG1lbnU6IE1lbnUpIHtcbiAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBpdGVtLnNldFRpdGxlKFwiQ2xvc2VcIilcbiAgICAgICAgICAgICAgICAuc2V0SWNvbihcImNyb3NzXCIpXG4gICAgICAgICAgICAgICAgLm9uQ2xpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZGV0YWNoTGVhdmVzT2ZUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgUkVWSUVXX1FVRVVFX1ZJRVdfVFlQRVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVkcmF3KCkge1xuICAgICAgICBjb25zdCBvcGVuRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG5cbiAgICAgICAgY29uc3Qgcm9vdEVsOiBIVE1MRWxlbWVudCA9IGNyZWF0ZURpdihcIm5hdi1mb2xkZXIgbW9kLXJvb3RcIik7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuRWw6IEhUTUxFbGVtZW50ID0gcm9vdEVsLmNyZWF0ZURpdihcIm5hdi1mb2xkZXItY2hpbGRyZW5cIik7XG5cbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLm5ld05vdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBuZXdOb3Rlc0ZvbGRlckVsOiBIVE1MRWxlbWVudCA9IHRoaXMuY3JlYXRlUmlnaHRQYW5lRm9sZGVyKFxuICAgICAgICAgICAgICAgIGNoaWxkcmVuRWwsXG4gICAgICAgICAgICAgICAgXCJOZXdcIixcbiAgICAgICAgICAgICAgICAhdGhpcy5hY3RpdmVGb2xkZXJzLmhhcyhcIk5ld1wiKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgbmV3RmlsZSBvZiB0aGlzLnBsdWdpbi5uZXdOb3Rlcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUmlnaHRQYW5lRmlsZShcbiAgICAgICAgICAgICAgICAgICAgbmV3Tm90ZXNGb2xkZXJFbCxcbiAgICAgICAgICAgICAgICAgICAgbmV3RmlsZSxcbiAgICAgICAgICAgICAgICAgICAgb3BlbkZpbGUgJiYgbmV3RmlsZS5wYXRoID09PSBvcGVuRmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5hY3RpdmVGb2xkZXJzLmhhcyhcIk5ld1wiKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wbHVnaW4uc2NoZWR1bGVkTm90ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IG5vdzogbnVtYmVyID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGxldCBjdXJyVW5peDogbnVtYmVyID0gLTE7XG4gICAgICAgICAgICBsZXQgZm9sZGVyRWwsIGZvbGRlclRpdGxlO1xuICAgICAgICAgICAgbGV0IG1heERheXNUb1JlbmRlcjogbnVtYmVyID0gZ2V0U2V0dGluZyhcbiAgICAgICAgICAgICAgICBcIm1heE5EYXlzTm90ZXNSZXZpZXdRdWV1ZVwiLFxuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLmRhdGEuc2V0dGluZ3NcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHNOb3RlIG9mIHRoaXMucGx1Z2luLnNjaGVkdWxlZE5vdGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNOb3RlLmR1ZVVuaXggIT0gY3VyclVuaXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5EYXlzOiBudW1iZXIgPSBNYXRoLmNlaWwoXG4gICAgICAgICAgICAgICAgICAgICAgICAoc05vdGUuZHVlVW5peCAtIG5vdykgLyAoMjQgKiAzNjAwICogMTAwMClcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobkRheXMgPiBtYXhEYXlzVG9SZW5kZXIpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvbGRlclRpdGxlID1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5EYXlzID09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlllc3RlcmRheVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuRGF5cyA9PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlRvZGF5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG5EYXlzID09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiVG9tb3Jyb3dcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbmV3IERhdGUoc05vdGUuZHVlVW5peCkudG9EYXRlU3RyaW5nKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyRWwgPSB0aGlzLmNyZWF0ZVJpZ2h0UGFuZUZvbGRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuRWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2xkZXJUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICF0aGlzLmFjdGl2ZUZvbGRlcnMuaGFzKGZvbGRlclRpdGxlKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBjdXJyVW5peCA9IHNOb3RlLmR1ZVVuaXg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVSaWdodFBhbmVGaWxlKFxuICAgICAgICAgICAgICAgICAgICBmb2xkZXJFbCxcbiAgICAgICAgICAgICAgICAgICAgc05vdGUubm90ZSxcbiAgICAgICAgICAgICAgICAgICAgb3BlbkZpbGUgJiYgc05vdGUubm90ZS5wYXRoID09PSBvcGVuRmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5hY3RpdmVGb2xkZXJzLmhhcyhmb2xkZXJUaXRsZSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudEVsID0gdGhpcy5jb250YWluZXJFbC5jaGlsZHJlblsxXTtcbiAgICAgICAgY29udGVudEVsLmVtcHR5KCk7XG4gICAgICAgIGNvbnRlbnRFbC5hcHBlbmRDaGlsZChyb290RWwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlUmlnaHRQYW5lRm9sZGVyKFxuICAgICAgICBwYXJlbnRFbDogYW55LFxuICAgICAgICBmb2xkZXJUaXRsZTogc3RyaW5nLFxuICAgICAgICBjb2xsYXBzZWQ6IGJvb2xlYW5cbiAgICApOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGZvbGRlckVsID0gcGFyZW50RWwuY3JlYXRlRGl2KFwibmF2LWZvbGRlclwiKTtcbiAgICAgICAgY29uc3QgZm9sZGVyVGl0bGVFbCA9IGZvbGRlckVsLmNyZWF0ZURpdihcIm5hdi1mb2xkZXItdGl0bGVcIik7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuRWwgPSBmb2xkZXJFbC5jcmVhdGVEaXYoXCJuYXYtZm9sZGVyLWNoaWxkcmVuXCIpO1xuICAgICAgICBjb25zdCBjb2xsYXBzZUljb25FbCA9IGZvbGRlclRpdGxlRWwuY3JlYXRlRGl2KFxuICAgICAgICAgICAgXCJuYXYtZm9sZGVyLWNvbGxhcHNlLWluZGljYXRvciBjb2xsYXBzZS1pY29uXCJcbiAgICAgICAgKTtcbiAgICAgICAgY29sbGFwc2VJY29uRWwuaW5uZXJIVE1MID0gQ09MTEFQU0VfSUNPTjtcblxuICAgICAgICBpZiAoY29sbGFwc2VkKVxuICAgICAgICAgICAgY29sbGFwc2VJY29uRWwuY2hpbGROb2Rlc1swXS5zdHlsZS50cmFuc2Zvcm0gPSBcInJvdGF0ZSgtOTBkZWcpXCI7XG5cbiAgICAgICAgZm9sZGVyVGl0bGVFbFxuICAgICAgICAgICAgLmNyZWF0ZURpdihcIm5hdi1mb2xkZXItdGl0bGUtY29udGVudFwiKVxuICAgICAgICAgICAgLnNldFRleHQoZm9sZGVyVGl0bGUpO1xuXG4gICAgICAgIGZvbGRlclRpdGxlRWwub25DbGlja0V2ZW50KChfOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuRWwuY2hpbGROb2Rlcykge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9PSBcImJsb2NrXCIgfHxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9PSBcIlwiXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VJY29uRWwuY2hpbGROb2Rlc1swXS5zdHlsZS50cmFuc2Zvcm0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyb3RhdGUoLTkwZGVnKVwiO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUZvbGRlcnMuZGVsZXRlKGZvbGRlclRpdGxlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZUljb25FbC5jaGlsZE5vZGVzWzBdLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlRm9sZGVycy5hZGQoZm9sZGVyVGl0bGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZvbGRlckVsO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlUmlnaHRQYW5lRmlsZShcbiAgICAgICAgZm9sZGVyRWw6IGFueSxcbiAgICAgICAgZmlsZTogVEZpbGUsXG4gICAgICAgIGZpbGVFbEFjdGl2ZTogYm9vbGVhbixcbiAgICAgICAgaGlkZGVuOiBib29sZWFuXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IG5hdkZpbGVFbDogSFRNTEVsZW1lbnQgPSBmb2xkZXJFbFxuICAgICAgICAgICAgLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJuYXYtZm9sZGVyLWNoaWxkcmVuXCIpWzBdXG4gICAgICAgICAgICAuY3JlYXRlRGl2KFwibmF2LWZpbGVcIik7XG4gICAgICAgIGlmIChoaWRkZW4pIG5hdkZpbGVFbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgICAgY29uc3QgbmF2RmlsZVRpdGxlOiBIVE1MRWxlbWVudCA9IG5hdkZpbGVFbC5jcmVhdGVEaXYoXCJuYXYtZmlsZS10aXRsZVwiKTtcbiAgICAgICAgaWYgKGZpbGVFbEFjdGl2ZSkgbmF2RmlsZVRpdGxlLmFkZENsYXNzKFwiaXMtYWN0aXZlXCIpO1xuXG4gICAgICAgIG5hdkZpbGVUaXRsZS5jcmVhdGVEaXYoXCJuYXYtZmlsZS10aXRsZS1jb250ZW50XCIpLnNldFRleHQoZmlsZS5iYXNlbmFtZSk7XG4gICAgICAgIG5hdkZpbGVUaXRsZS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgXCJjbGlja1wiLFxuICAgICAgICAgICAgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZi5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcblxuICAgICAgICBuYXZGaWxlVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwiY29udGV4dG1lbnVcIixcbiAgICAgICAgICAgIChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZU1lbnUgPSBuZXcgTWVudSh0aGlzLmFwcCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLnRyaWdnZXIoXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsZS1tZW51XCIsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVNZW51LFxuICAgICAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgICAgICBcIm15LWNvbnRleHQtbWVudVwiLFxuICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBmaWxlTWVudS5zaG93QXRQb3NpdGlvbih7XG4gICAgICAgICAgICAgICAgICAgIHg6IGV2ZW50LnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICB5OiBldmVudC5wYWdlWSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge1xyXG4gICAgTm90aWNlLFxyXG4gICAgUGx1Z2luLFxyXG4gICAgYWRkSWNvbixcclxuICAgIFRGaWxlLFxyXG4gICAgSGVhZGluZ0NhY2hlLFxyXG4gICAgZ2V0QWxsVGFncyxcclxufSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0ICogYXMgZ3JhcGggZnJvbSBcInBhZ2VyYW5rLmpzXCI7XHJcbmltcG9ydCB7IFNSU2V0dGluZ1RhYiwgREVGQVVMVF9TRVRUSU5HUywgZ2V0U2V0dGluZyB9IGZyb20gXCIuL3NldHRpbmdzXCI7XHJcbmltcG9ydCB7IEZsYXNoY2FyZE1vZGFsIH0gZnJvbSBcIi4vZmxhc2hjYXJkLW1vZGFsXCI7XHJcbmltcG9ydCB7IFN0YXRzTW9kYWwgfSBmcm9tIFwiLi9zdGF0cy1tb2RhbFwiO1xyXG5pbXBvcnQgeyBSZXZpZXdRdWV1ZUxpc3RWaWV3LCBSRVZJRVdfUVVFVUVfVklFV19UWVBFIH0gZnJvbSBcIi4vc2lkZWJhclwiO1xyXG5pbXBvcnQgeyBzY2hlZHVsZSB9IGZyb20gXCIuL3NjaGVkXCI7XHJcbmltcG9ydCB7XHJcbiAgICBTY2hlZE5vdGUsXHJcbiAgICBMaW5rU3RhdCxcclxuICAgIENhcmQsXHJcbiAgICBDYXJkVHlwZSxcclxuICAgIFJldmlld1Jlc3BvbnNlLFxyXG4gICAgU1JTZXR0aW5ncyxcclxuICAgIERlY2ssXHJcbn0gZnJvbSBcIi4vdHlwZXNcIjtcclxuaW1wb3J0IHtcclxuICAgIENST1NTX0hBSVJTX0lDT04sXHJcbiAgICBTQ0hFRFVMSU5HX0lORk9fUkVHRVgsXHJcbiAgICBZQU1MX0ZST05UX01BVFRFUl9SRUdFWCxcclxuICAgIENMT1pFX0NBUkRfREVURUNUT1IsXHJcbiAgICBDTE9aRV9ERUxFVElPTlNfRVhUUkFDVE9SLFxyXG4gICAgQ0xPWkVfU0NIRURVTElOR19FWFRSQUNUT1IsXHJcbiAgICBDT0RFQkxPQ0tfUkVHRVgsXHJcbiAgICBJTkxJTkVfQ09ERV9SRUdFWCxcclxufSBmcm9tIFwiLi9jb25zdGFudHNcIjtcclxuaW1wb3J0IHsgZXNjYXBlUmVnZXhTdHJpbmcsIGN5cmI1MyB9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5pbnRlcmZhY2UgUGx1Z2luRGF0YSB7XHJcbiAgICBzZXR0aW5nczogU1JTZXR0aW5ncztcclxuICAgIGJ1cnlEYXRlOiBzdHJpbmc7XHJcbiAgICAvLyBoYXNoZXMgb2YgY2FyZCB0ZXh0c1xyXG4gICAgLy8gc2hvdWxkIHdvcmsgYXMgbG9uZyBhcyB1c2VyIGRvZXNuJ3QgbW9kaWZ5IGNhcmQncyB0ZXh0XHJcbiAgICAvLyBjb3ZlcnMgbW9zdCBvZiB0aGUgY2FzZXNcclxuICAgIGJ1cnlMaXN0OiBzdHJpbmdbXTtcclxufVxyXG5cclxuY29uc3QgREVGQVVMVF9EQVRBOiBQbHVnaW5EYXRhID0ge1xyXG4gICAgc2V0dGluZ3M6IERFRkFVTFRfU0VUVElOR1MsXHJcbiAgICBidXJ5RGF0ZTogXCJcIixcclxuICAgIGJ1cnlMaXN0OiBbXSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNSUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICAgIHByaXZhdGUgc3RhdHVzQmFyOiBIVE1MRWxlbWVudDtcclxuICAgIHByaXZhdGUgcmV2aWV3UXVldWVWaWV3OiBSZXZpZXdRdWV1ZUxpc3RWaWV3O1xyXG4gICAgcHVibGljIGRhdGE6IFBsdWdpbkRhdGE7XHJcblxyXG4gICAgcHVibGljIG5ld05vdGVzOiBURmlsZVtdID0gW107XHJcbiAgICBwdWJsaWMgc2NoZWR1bGVkTm90ZXM6IFNjaGVkTm90ZVtdID0gW107XHJcbiAgICBwcml2YXRlIGVhc2VCeVBhdGg6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcclxuICAgIHByaXZhdGUgaW5jb21pbmdMaW5rczogUmVjb3JkPHN0cmluZywgTGlua1N0YXRbXT4gPSB7fTtcclxuICAgIHByaXZhdGUgcGFnZXJhbmtzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XHJcbiAgICBwcml2YXRlIGR1ZU5vdGVzQ291bnQ6IG51bWJlciA9IDA7XHJcbiAgICBwdWJsaWMgZHVlRGF0ZXNOb3RlczogUmVjb3JkPG51bWJlciwgbnVtYmVyPiA9IHt9OyAvLyBSZWNvcmQ8IyBvZiBkYXlzIGluIGZ1dHVyZSwgZHVlIGNvdW50PlxyXG5cclxuICAgIHB1YmxpYyBkZWNrVHJlZTogRGVjayA9IG5ldyBEZWNrKFwicm9vdFwiLCBudWxsKTtcclxuICAgIHB1YmxpYyBkdWVEYXRlc0ZsYXNoY2FyZHM6IFJlY29yZDxudW1iZXIsIG51bWJlcj4gPSB7fTsgLy8gUmVjb3JkPCMgb2YgZGF5cyBpbiBmdXR1cmUsIGR1ZSBjb3VudD5cclxuXHJcbiAgICBwdWJsaWMgc2luZ2xlbGluZUNhcmRSZWdleDogUmVnRXhwO1xyXG4gICAgcHVibGljIG11bHRpbGluZUNhcmRSZWdleDogUmVnRXhwO1xyXG5cclxuICAgIC8vIHByZXZlbnQgY2FsbGluZyB0aGVzZSBmdW5jdGlvbnMgaWYgYW5vdGhlciBpbnN0YW5jZSBpcyBhbHJlYWR5IHJ1bm5pbmdcclxuICAgIHByaXZhdGUgbm90ZXNTeW5jTG9jazogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBmbGFzaGNhcmRzU3luY0xvY2s6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBhc3luYyBvbmxvYWQoKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkUGx1Z2luRGF0YSgpO1xyXG5cclxuICAgICAgICBhZGRJY29uKFwiY3Jvc3NoYWlyc1wiLCBDUk9TU19IQUlSU19JQ09OKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNCYXIgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcclxuICAgICAgICB0aGlzLnN0YXR1c0Jhci5jbGFzc0xpc3QuYWRkKFwibW9kLWNsaWNrYWJsZVwiKTtcclxuICAgICAgICB0aGlzLnN0YXR1c0Jhci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIFwiT3BlbiBhIG5vdGUgZm9yIHJldmlld1wiKTtcclxuICAgICAgICB0aGlzLnN0YXR1c0Jhci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsLXBvc2l0aW9uXCIsIFwidG9wXCIpO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzQmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoXzogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5ub3Rlc1N5bmNMb2NrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN5bmMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmV2aWV3TmV4dE5vdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNpbmdsZWxpbmVDYXJkUmVnZXggPSBuZXcgUmVnRXhwKFxyXG4gICAgICAgICAgICBgXiguKykke2VzY2FwZVJlZ2V4U3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgZ2V0U2V0dGluZyhcInNpbmdsZWxpbmVDYXJkU2VwYXJhdG9yXCIsIHRoaXMuZGF0YS5zZXR0aW5ncylcclxuICAgICAgICAgICAgKX0oLis/KVxcXFxuPyg/OjwhLS1TUjooLispLChcXFxcZCspLChcXFxcZCspLS0+fCQpYCxcclxuICAgICAgICAgICAgXCJnbVwiXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aWxpbmVDYXJkUmVnZXggPSBuZXcgUmVnRXhwKFxyXG4gICAgICAgICAgICBgXigoPzouK1xcXFxuKSspJHtlc2NhcGVSZWdleFN0cmluZyhcclxuICAgICAgICAgICAgICAgIGdldFNldHRpbmcoXCJtdWx0aWxpbmVDYXJkU2VwYXJhdG9yXCIsIHRoaXMuZGF0YS5zZXR0aW5ncylcclxuICAgICAgICAgICAgKX1cXFxcbigoPzouKz9cXFxcbj8pKz8pKD86PCEtLVNSOiguKyksKFxcXFxkKyksKFxcXFxkKyktLT58JClgLFxyXG4gICAgICAgICAgICBcImdtXCJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLmFkZFJpYmJvbkljb24oXCJjcm9zc2hhaXJzXCIsIFwiUmV2aWV3IGZsYXNoY2FyZHNcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZmxhc2hjYXJkc1N5bmNMb2NrKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmZsYXNoY2FyZHNfc3luYygpO1xyXG4gICAgICAgICAgICAgICAgbmV3IEZsYXNoY2FyZE1vZGFsKHRoaXMuYXBwLCB0aGlzKS5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclZpZXcoXHJcbiAgICAgICAgICAgIFJFVklFV19RVUVVRV9WSUVXX1RZUEUsXHJcbiAgICAgICAgICAgIChsZWFmKSA9PlxyXG4gICAgICAgICAgICAgICAgKHRoaXMucmV2aWV3UXVldWVWaWV3ID0gbmV3IFJldmlld1F1ZXVlTGlzdFZpZXcobGVhZiwgdGhpcykpXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEuc2V0dGluZ3MuZGlzYWJsZUZpbGVNZW51UmV2aWV3T3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub24oXCJmaWxlLW1lbnVcIiwgKG1lbnUsIGZpbGU6IFRGaWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc2V0VGl0bGUoXCJSZXZpZXc6IEVhc3lcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRJY29uKFwiY3Jvc3NoYWlyc1wiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uQ2xpY2soKGV2dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLmV4dGVuc2lvbiA9PSBcIm1kXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVJldmlld1Jlc3BvbnNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmlld1Jlc3BvbnNlLkVhc3lcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXRUaXRsZShcIlJldmlldzogR29vZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldEljb24oXCJjcm9zc2hhaXJzXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAub25DbGljaygoZXZ0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuZXh0ZW5zaW9uID09IFwibWRcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlUmV2aWV3UmVzcG9uc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV2aWV3UmVzcG9uc2UuR29vZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuYWRkSXRlbSgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnNldFRpdGxlKFwiUmV2aWV3OiBIYXJkXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0SWNvbihcImNyb3NzaGFpcnNcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKChldnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5leHRlbnNpb24gPT0gXCJtZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVSZXZpZXdSZXNwb25zZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXZpZXdSZXNwb25zZS5IYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICAgICAgICBpZDogXCJzcnMtbm90ZS1yZXZpZXctb3Blbi1ub3RlXCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwiT3BlbiBhIG5vdGUgZm9yIHJldmlld1wiLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm5vdGVzU3luY0xvY2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN5bmMoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJldmlld05leHROb3RlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgIGlkOiBcInNycy1ub3RlLXJldmlldy1lYXN5XCIsXHJcbiAgICAgICAgICAgIG5hbWU6IFwiUmV2aWV3IG5vdGUgYXMgZWFzeVwiLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3BlbkZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wZW5GaWxlICYmIG9wZW5GaWxlLmV4dGVuc2lvbiA9PSBcIm1kXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zYXZlUmV2aWV3UmVzcG9uc2Uob3BlbkZpbGUsIFJldmlld1Jlc3BvbnNlLkVhc3kpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xyXG4gICAgICAgICAgICBpZDogXCJzcnMtbm90ZS1yZXZpZXctZ29vZFwiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIlJldmlldyBub3RlIGFzIGdvb2RcIixcclxuICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5GaWxlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcGVuRmlsZSAmJiBvcGVuRmlsZS5leHRlbnNpb24gPT0gXCJtZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2F2ZVJldmlld1Jlc3BvbnNlKG9wZW5GaWxlLCBSZXZpZXdSZXNwb25zZS5Hb29kKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgaWQ6IFwic3JzLW5vdGUtcmV2aWV3LWhhcmRcIixcclxuICAgICAgICAgICAgbmFtZTogXCJSZXZpZXcgbm90ZSBhcyBoYXJkXCIsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvcGVuRmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob3BlbkZpbGUgJiYgb3BlbkZpbGUuZXh0ZW5zaW9uID09IFwibWRcIilcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNhdmVSZXZpZXdSZXNwb25zZShvcGVuRmlsZSwgUmV2aWV3UmVzcG9uc2UuSGFyZCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XHJcbiAgICAgICAgICAgIGlkOiBcInNycy1yZXZpZXctZmxhc2hjYXJkc1wiLFxyXG4gICAgICAgICAgICBuYW1lOiBcIlJldmlldyBmbGFzaGNhcmRzXCIsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZmxhc2hjYXJkc1N5bmNMb2NrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5mbGFzaGNhcmRzX3N5bmMoKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRmxhc2hjYXJkTW9kYWwodGhpcy5hcHAsIHRoaXMpLm9wZW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgICAgICAgaWQ6IFwic3JzLXZpZXctc3RhdHNcIixcclxuICAgICAgICAgICAgbmFtZTogXCJWaWV3IHN0YXRpc3RpY3NcIixcclxuICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIG5ldyBTdGF0c01vZGFsKHRoaXMuYXBwLCB0aGlzLmR1ZURhdGVzRmxhc2hjYXJkcykub3BlbigpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNSU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub25MYXlvdXRSZWFkeSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFZpZXcoKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnN5bmMoKSwgMjAwMCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5mbGFzaGNhcmRzX3N5bmMoKSwgMjAwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb251bmxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlXHJcbiAgICAgICAgICAgIC5nZXRMZWF2ZXNPZlR5cGUoUkVWSUVXX1FVRVVFX1ZJRVdfVFlQRSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGxlYWYpID0+IGxlYWYuZGV0YWNoKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHN5bmMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubm90ZXNTeW5jTG9jaykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMubm90ZXNTeW5jTG9jayA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBub3RlcyA9IHRoaXMuYXBwLnZhdWx0LmdldE1hcmtkb3duRmlsZXMoKTtcclxuXHJcbiAgICAgICAgZ3JhcGgucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlZE5vdGVzID0gW107XHJcbiAgICAgICAgdGhpcy5lYXNlQnlQYXRoID0ge307XHJcbiAgICAgICAgdGhpcy5uZXdOb3RlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaW5jb21pbmdMaW5rcyA9IHt9O1xyXG4gICAgICAgIHRoaXMucGFnZXJhbmtzID0ge307XHJcbiAgICAgICAgdGhpcy5kdWVOb3Rlc0NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLmR1ZURhdGVzTm90ZXMgPSB7fTtcclxuXHJcbiAgICAgICAgbGV0IG5vdzogbnVtYmVyID0gRGF0ZS5ub3coKTtcclxuICAgICAgICBmb3IgKGxldCBub3RlIG9mIG5vdGVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmluY29taW5nTGlua3Nbbm90ZS5wYXRoXSA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluY29taW5nTGlua3Nbbm90ZS5wYXRoXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgbGV0IGxpbmtzID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5yZXNvbHZlZExpbmtzW25vdGUucGF0aF0gfHwge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhcmdldFBhdGggaW4gbGlua3MpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluY29taW5nTGlua3NbdGFyZ2V0UGF0aF0gPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jb21pbmdMaW5rc1t0YXJnZXRQYXRoXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG1hcmtkb3duIGZpbGVzIG9ubHlcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRQYXRoLnNwbGl0KFwiLlwiKS5wb3AoKS50b0xvd2VyQ2FzZSgpID09IFwibWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jb21pbmdMaW5rc1t0YXJnZXRQYXRoXS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlUGF0aDogbm90ZS5wYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rQ291bnQ6IGxpbmtzW3RhcmdldFBhdGhdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBncmFwaC5saW5rKG5vdGUucGF0aCwgdGFyZ2V0UGF0aCwgbGlua3NbdGFyZ2V0UGF0aF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZmlsZUNhY2hlZERhdGEgPVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUobm90ZSkgfHwge307XHJcblxyXG4gICAgICAgICAgICBsZXQgZnJvbnRtYXR0ZXIgPVxyXG4gICAgICAgICAgICAgICAgZmlsZUNhY2hlZERhdGEuZnJvbnRtYXR0ZXIgfHwgPFJlY29yZDxzdHJpbmcsIGFueT4+e307XHJcbiAgICAgICAgICAgIGxldCB0YWdzID0gZ2V0QWxsVGFncyhmaWxlQ2FjaGVkRGF0YSkgfHwgW107XHJcblxyXG4gICAgICAgICAgICBsZXQgc2hvdWxkSWdub3JlOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICAgICAgb3V0ZXI6IGZvciAobGV0IHRhZyBvZiB0YWdzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0YWdUb1JldmlldyBvZiB0aGlzLmRhdGEuc2V0dGluZ3MudGFnc1RvUmV2aWV3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWcgPT0gdGFnVG9SZXZpZXcgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnLnN0YXJ0c1dpdGgodGFnVG9SZXZpZXcgKyBcIi9cIilcclxuICAgICAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkSWdub3JlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIG91dGVyO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHNob3VsZElnbm9yZSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBmaWxlIGhhcyBubyBzY2hlZHVsaW5nIGluZm9ybWF0aW9uXHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICEoXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRtYXR0ZXIuaGFzT3duUHJvcGVydHkoXCJzci1kdWVcIikgJiZcclxuICAgICAgICAgICAgICAgICAgICBmcm9udG1hdHRlci5oYXNPd25Qcm9wZXJ0eShcInNyLWludGVydmFsXCIpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbnRtYXR0ZXIuaGFzT3duUHJvcGVydHkoXCJzci1lYXNlXCIpXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZXdOb3Rlcy5wdXNoKG5vdGUpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBkdWVVbml4OiBudW1iZXIgPSB3aW5kb3dcclxuICAgICAgICAgICAgICAgIC5tb21lbnQoZnJvbnRtYXR0ZXJbXCJzci1kdWVcIl0sIFtcclxuICAgICAgICAgICAgICAgICAgICBcIllZWVktTU0tRERcIixcclxuICAgICAgICAgICAgICAgICAgICBcIkRELU1NLVlZWVlcIixcclxuICAgICAgICAgICAgICAgICAgICBcImRkZCBNTU0gREQgWVlZWVwiLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIC52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVkTm90ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBub3RlLFxyXG4gICAgICAgICAgICAgICAgZHVlVW5peCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVhc2VCeVBhdGhbbm90ZS5wYXRoXSA9IGZyb250bWF0dGVyW1wic3ItZWFzZVwiXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkdWVVbml4IDw9IG5vdykgdGhpcy5kdWVOb3Rlc0NvdW50Kys7XHJcbiAgICAgICAgICAgIGxldCBuRGF5czogbnVtYmVyID0gTWF0aC5jZWlsKChkdWVVbml4IC0gbm93KSAvICgyNCAqIDM2MDAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kdWVEYXRlc05vdGVzLmhhc093blByb3BlcnR5KG5EYXlzKSlcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVlRGF0ZXNOb3Rlc1tuRGF5c10gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmR1ZURhdGVzTm90ZXNbbkRheXNdKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncmFwaC5yYW5rKDAuODUsIDAuMDAwMDAxLCAobm9kZTogc3RyaW5nLCByYW5rOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYWdlcmFua3Nbbm9kZV0gPSByYW5rICogMTAwMDA7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHNvcnQgbmV3IG5vdGVzIGJ5IGltcG9ydGFuY2VcclxuICAgICAgICB0aGlzLm5ld05vdGVzID0gdGhpcy5uZXdOb3Rlcy5zb3J0KFxyXG4gICAgICAgICAgICAoYTogVEZpbGUsIGI6IFRGaWxlKSA9PlxyXG4gICAgICAgICAgICAgICAgKHRoaXMucGFnZXJhbmtzW2IucGF0aF0gfHwgMCkgLSAodGhpcy5wYWdlcmFua3NbYS5wYXRoXSB8fCAwKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIHNvcnQgc2NoZWR1bGVkIG5vdGVzIGJ5IGRhdGUgJiB3aXRoaW4gdGhvc2UgZGF5cywgc29ydCB0aGVtIGJ5IGltcG9ydGFuY2VcclxuICAgICAgICB0aGlzLnNjaGVkdWxlZE5vdGVzID0gdGhpcy5zY2hlZHVsZWROb3Rlcy5zb3J0KFxyXG4gICAgICAgICAgICAoYTogU2NoZWROb3RlLCBiOiBTY2hlZE5vdGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBhLmR1ZVVuaXggLSBiLmR1ZVVuaXg7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9IDApIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnBhZ2VyYW5rc1tiLm5vdGUucGF0aF0gfHwgMCkgLVxyXG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnBhZ2VyYW5rc1thLm5vdGUucGF0aF0gfHwgMClcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBsZXQgbm90ZUNvdW50VGV4dCA9IHRoaXMuZHVlTm90ZXNDb3VudCA9PSAxID8gXCJub3RlXCIgOiBcIm5vdGVzXCI7XHJcbiAgICAgICAgbGV0IGNhcmRDb3VudFRleHQgPVxyXG4gICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmR1ZUZsYXNoY2FyZHNDb3VudCA9PSAxID8gXCJjYXJkXCIgOiBcImNhcmRzXCI7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNCYXIuc2V0VGV4dChcclxuICAgICAgICAgICAgYFJldmlldzogJHt0aGlzLmR1ZU5vdGVzQ291bnR9ICR7bm90ZUNvdW50VGV4dH0sICR7dGhpcy5kZWNrVHJlZS5kdWVGbGFzaGNhcmRzQ291bnR9ICR7Y2FyZENvdW50VGV4dH0gZHVlYFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5yZXZpZXdRdWV1ZVZpZXcucmVkcmF3KCk7XHJcblxyXG4gICAgICAgIHRoaXMubm90ZXNTeW5jTG9jayA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNhdmVSZXZpZXdSZXNwb25zZShub3RlOiBURmlsZSwgcmVzcG9uc2U6IFJldmlld1Jlc3BvbnNlKSB7XHJcbiAgICAgICAgbGV0IGZpbGVDYWNoZWREYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUobm90ZSkgfHwge307XHJcbiAgICAgICAgbGV0IGZyb250bWF0dGVyID0gZmlsZUNhY2hlZERhdGEuZnJvbnRtYXR0ZXIgfHwgPFJlY29yZDxzdHJpbmcsIGFueT4+e307XHJcblxyXG4gICAgICAgIGxldCB0YWdzID0gZ2V0QWxsVGFncyhmaWxlQ2FjaGVkRGF0YSkgfHwgW107XHJcbiAgICAgICAgbGV0IHNob3VsZElnbm9yZTogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgb3V0ZXI6IGZvciAobGV0IHRhZyBvZiB0YWdzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhZ1RvUmV2aWV3IG9mIHRoaXMuZGF0YS5zZXR0aW5ncy50YWdzVG9SZXZpZXcpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0YWcgPT0gdGFnVG9SZXZpZXcgfHwgdGFnLnN0YXJ0c1dpdGgodGFnVG9SZXZpZXcgKyBcIi9cIikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaG91bGRJZ25vcmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhayBvdXRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNob3VsZElnbm9yZSkge1xyXG4gICAgICAgICAgICBuZXcgTm90aWNlKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgdGFnIHRoZSBub3RlIGFwcHJvcHJpYXRlbHkgZm9yIHJldmlld2luZyAoaW4gc2V0dGluZ3MpLlwiXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmaWxlVGV4dDogc3RyaW5nID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChub3RlKTtcclxuICAgICAgICBsZXQgZWFzZSwgaW50ZXJ2YWwsIGRlbGF5QmVmb3JlUmV2aWV3O1xyXG4gICAgICAgIGxldCBub3c6IG51bWJlciA9IERhdGUubm93KCk7XHJcbiAgICAgICAgLy8gbmV3IG5vdGVcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICEoXHJcbiAgICAgICAgICAgICAgICBmcm9udG1hdHRlci5oYXNPd25Qcm9wZXJ0eShcInNyLWR1ZVwiKSAmJlxyXG4gICAgICAgICAgICAgICAgZnJvbnRtYXR0ZXIuaGFzT3duUHJvcGVydHkoXCJzci1pbnRlcnZhbFwiKSAmJlxyXG4gICAgICAgICAgICAgICAgZnJvbnRtYXR0ZXIuaGFzT3duUHJvcGVydHkoXCJzci1lYXNlXCIpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgbGV0IGxpbmtUb3RhbCA9IDAsXHJcbiAgICAgICAgICAgICAgICBsaW5rUEdUb3RhbCA9IDAsXHJcbiAgICAgICAgICAgICAgICB0b3RhbExpbmtDb3VudCA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBzdGF0T2JqIG9mIHRoaXMuaW5jb21pbmdMaW5rc1tub3RlLnBhdGhdIHx8IFtdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWFzZSA9IHRoaXMuZWFzZUJ5UGF0aFtzdGF0T2JqLnNvdXJjZVBhdGhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaW5rVG90YWwgKz1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdE9iai5saW5rQ291bnQgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2VyYW5rc1tzdGF0T2JqLnNvdXJjZVBhdGhdICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzZTtcclxuICAgICAgICAgICAgICAgICAgICBsaW5rUEdUb3RhbCArPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2VyYW5rc1tzdGF0T2JqLnNvdXJjZVBhdGhdICogc3RhdE9iai5saW5rQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWxMaW5rQ291bnQgKz0gc3RhdE9iai5saW5rQ291bnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBvdXRnb2luZ0xpbmtzID1cclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUucmVzb2x2ZWRMaW5rc1tub3RlLnBhdGhdIHx8IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsaW5rZWRGaWxlUGF0aCBpbiBvdXRnb2luZ0xpbmtzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWFzZSA9IHRoaXMuZWFzZUJ5UGF0aFtsaW5rZWRGaWxlUGF0aF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZWFzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtUb3RhbCArPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRnb2luZ0xpbmtzW2xpbmtlZEZpbGVQYXRoXSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFnZXJhbmtzW2xpbmtlZEZpbGVQYXRoXSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlua1BHVG90YWwgKz1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdlcmFua3NbbGlua2VkRmlsZVBhdGhdICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0Z29pbmdMaW5rc1tsaW5rZWRGaWxlUGF0aF07XHJcbiAgICAgICAgICAgICAgICAgICAgdG90YWxMaW5rQ291bnQgKz0gb3V0Z29pbmdMaW5rc1tsaW5rZWRGaWxlUGF0aF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBsaW5rQ29udHJpYnV0aW9uID1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5zZXR0aW5ncy5tYXhMaW5rRmFjdG9yICpcclxuICAgICAgICAgICAgICAgIE1hdGgubWluKDEuMCwgTWF0aC5sb2codG90YWxMaW5rQ291bnQgKyAwLjUpIC8gTWF0aC5sb2coNjQpKTtcclxuICAgICAgICAgICAgZWFzZSA9IE1hdGgucm91bmQoXHJcbiAgICAgICAgICAgICAgICAoMS4wIC0gbGlua0NvbnRyaWJ1dGlvbikgKiB0aGlzLmRhdGEuc2V0dGluZ3MuYmFzZUVhc2UgK1xyXG4gICAgICAgICAgICAgICAgICAgICh0b3RhbExpbmtDb3VudCA+IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyAobGlua0NvbnRyaWJ1dGlvbiAqIGxpbmtUb3RhbCkgLyBsaW5rUEdUb3RhbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGxpbmtDb250cmlidXRpb24gKiB0aGlzLmRhdGEuc2V0dGluZ3MuYmFzZUVhc2UpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gMTtcclxuICAgICAgICAgICAgZGVsYXlCZWZvcmVSZXZpZXcgPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGludGVydmFsID0gZnJvbnRtYXR0ZXJbXCJzci1pbnRlcnZhbFwiXTtcclxuICAgICAgICAgICAgZWFzZSA9IGZyb250bWF0dGVyW1wic3ItZWFzZVwiXTtcclxuICAgICAgICAgICAgZGVsYXlCZWZvcmVSZXZpZXcgPVxyXG4gICAgICAgICAgICAgICAgbm93IC1cclxuICAgICAgICAgICAgICAgIHdpbmRvd1xyXG4gICAgICAgICAgICAgICAgICAgIC5tb21lbnQoZnJvbnRtYXR0ZXJbXCJzci1kdWVcIl0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJZWVlZLU1NLUREXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiREQtTU0tWVlZWVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRkZCBNTU0gREQgWVlZWVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLnZhbHVlT2YoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzY2hlZE9iaiA9IHNjaGVkdWxlKFxyXG4gICAgICAgICAgICByZXNwb25zZSxcclxuICAgICAgICAgICAgaW50ZXJ2YWwsXHJcbiAgICAgICAgICAgIGVhc2UsXHJcbiAgICAgICAgICAgIGRlbGF5QmVmb3JlUmV2aWV3LFxyXG4gICAgICAgICAgICB0aGlzLmRhdGEuc2V0dGluZ3MsXHJcbiAgICAgICAgICAgIHRoaXMuZHVlRGF0ZXNOb3Rlc1xyXG4gICAgICAgICk7XHJcbiAgICAgICAgaW50ZXJ2YWwgPSBzY2hlZE9iai5pbnRlcnZhbDtcclxuICAgICAgICBlYXNlID0gc2NoZWRPYmouZWFzZTtcclxuXHJcbiAgICAgICAgbGV0IGR1ZSA9IHdpbmRvdy5tb21lbnQobm93ICsgaW50ZXJ2YWwgKiAyNCAqIDM2MDAgKiAxMDAwKTtcclxuICAgICAgICBsZXQgZHVlU3RyaW5nID0gZHVlLmZvcm1hdChcIllZWVktTU0tRERcIik7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHNjaGVkdWxpbmcgaW5mbyBleGlzdHNcclxuICAgICAgICBpZiAoU0NIRURVTElOR19JTkZPX1JFR0VYLnRlc3QoZmlsZVRleHQpKSB7XHJcbiAgICAgICAgICAgIGxldCBzY2hlZHVsaW5nSW5mbyA9IFNDSEVEVUxJTkdfSU5GT19SRUdFWC5leGVjKGZpbGVUZXh0KTtcclxuICAgICAgICAgICAgZmlsZVRleHQgPSBmaWxlVGV4dC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICAgU0NIRURVTElOR19JTkZPX1JFR0VYLFxyXG4gICAgICAgICAgICAgICAgYC0tLVxcbiR7c2NoZWR1bGluZ0luZm9bMV19c3ItZHVlOiAke2R1ZVN0cmluZ31cXG5zci1pbnRlcnZhbDogJHtpbnRlcnZhbH1cXG5zci1lYXNlOiAke2Vhc2V9XFxuJHtzY2hlZHVsaW5nSW5mb1s1XX0tLS1gXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAvLyBuZXcgbm90ZSB3aXRoIGV4aXN0aW5nIFlBTUwgZnJvbnQgbWF0dGVyXHJcbiAgICAgICAgfSBlbHNlIGlmIChZQU1MX0ZST05UX01BVFRFUl9SRUdFWC50ZXN0KGZpbGVUZXh0KSkge1xyXG4gICAgICAgICAgICBsZXQgZXhpc3RpbmdZYW1sID0gWUFNTF9GUk9OVF9NQVRURVJfUkVHRVguZXhlYyhmaWxlVGV4dCk7XHJcbiAgICAgICAgICAgIGZpbGVUZXh0ID0gZmlsZVRleHQucmVwbGFjZShcclxuICAgICAgICAgICAgICAgIFlBTUxfRlJPTlRfTUFUVEVSX1JFR0VYLFxyXG4gICAgICAgICAgICAgICAgYC0tLVxcbiR7ZXhpc3RpbmdZYW1sWzFdfXNyLWR1ZTogJHtkdWVTdHJpbmd9XFxuc3ItaW50ZXJ2YWw6ICR7aW50ZXJ2YWx9XFxuc3ItZWFzZTogJHtlYXNlfVxcbi0tLWBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmaWxlVGV4dCA9IGAtLS1cXG5zci1kdWU6ICR7ZHVlU3RyaW5nfVxcbnNyLWludGVydmFsOiAke2ludGVydmFsfVxcbnNyLWVhc2U6ICR7ZWFzZX1cXG4tLS1cXG5cXG4ke2ZpbGVUZXh0fWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFwcC52YXVsdC5tb2RpZnkobm90ZSwgZmlsZVRleHQpO1xyXG5cclxuICAgICAgICBuZXcgTm90aWNlKFwiUmVzcG9uc2UgcmVjZWl2ZWQuXCIpO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm5vdGVzU3luY0xvY2spIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3luYygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5zZXR0aW5ncy5hdXRvTmV4dE5vdGUpIHRoaXMucmV2aWV3TmV4dE5vdGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmV2aWV3TmV4dE5vdGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHVlTm90ZXNDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5kYXRhLnNldHRpbmdzLm9wZW5SYW5kb21Ob3RlXHJcbiAgICAgICAgICAgICAgICA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuZHVlTm90ZXNDb3VudClcclxuICAgICAgICAgICAgICAgIDogMDtcclxuICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmFjdGl2ZUxlYWYub3BlbkZpbGUoXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjaGVkdWxlZE5vdGVzW2luZGV4XS5ub3RlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm5ld05vdGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5kYXRhLnNldHRpbmdzLm9wZW5SYW5kb21Ob3RlXHJcbiAgICAgICAgICAgICAgICA/IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMubmV3Tm90ZXMubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgOiAwO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZi5vcGVuRmlsZSh0aGlzLm5ld05vdGVzW2luZGV4XSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5ldyBOb3RpY2UoXCJZb3UncmUgZG9uZSBmb3IgdGhlIGRheSA6RC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZmxhc2hjYXJkc19zeW5jKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmZsYXNoY2FyZHNTeW5jTG9jaykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZmxhc2hjYXJkc1N5bmNMb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbGV0IG5vdGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xyXG5cclxuICAgICAgICB0aGlzLmRlY2tUcmVlID0gbmV3IERlY2soXCJyb290XCIsIG51bGwpO1xyXG4gICAgICAgIHRoaXMuZHVlRGF0ZXNGbGFzaGNhcmRzID0ge307XHJcblxyXG4gICAgICAgIGxldCB0b2RheURhdGUgPSB3aW5kb3cubW9tZW50KERhdGUubm93KCkpLmZvcm1hdChcIllZWVktTU0tRERcIik7XHJcbiAgICAgICAgLy8gY2xlYXIgbGlzdCBpZiB3ZSd2ZSBjaGFuZ2VkIGRhdGVzXHJcbiAgICAgICAgaWYgKHRvZGF5RGF0ZSAhPSB0aGlzLmRhdGEuYnVyeURhdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhLmJ1cnlEYXRlID0gdG9kYXlEYXRlO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEuYnVyeUxpc3QgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IG5vdGUgb2Ygbm90ZXMpIHtcclxuICAgICAgICAgICAgaWYgKGdldFNldHRpbmcoXCJjb252ZXJ0Rm9sZGVyc1RvRGVja3NcIiwgdGhpcy5kYXRhLnNldHRpbmdzKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZ1tdID0gbm90ZS5wYXRoLnNwbGl0KFwiL1wiKTtcclxuICAgICAgICAgICAgICAgIHBhdGgucG9wKCk7IC8vIHJlbW92ZSBmaWxlbmFtZVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5maW5kRmxhc2hjYXJkcyhub3RlLCBcIiNcIiArIHBhdGguam9pbihcIi9cIikpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmaWxlQ2FjaGVkRGF0YSA9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShub3RlKSB8fCB7fTtcclxuICAgICAgICAgICAgbGV0IGZyb250bWF0dGVyID1cclxuICAgICAgICAgICAgICAgIGZpbGVDYWNoZWREYXRhLmZyb250bWF0dGVyIHx8IDxSZWNvcmQ8c3RyaW5nLCBhbnk+Pnt9O1xyXG4gICAgICAgICAgICBsZXQgdGFncyA9IGdldEFsbFRhZ3MoZmlsZUNhY2hlZERhdGEpIHx8IFtdO1xyXG5cclxuICAgICAgICAgICAgb3V0ZXI6IGZvciAobGV0IHRhZyBvZiB0YWdzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB0YWdUb1JldmlldyBvZiB0aGlzLmRhdGEuc2V0dGluZ3MuZmxhc2hjYXJkVGFncykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnID09IHRhZ1RvUmV2aWV3IHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5zdGFydHNXaXRoKHRhZ1RvUmV2aWV3ICsgXCIvXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZmluZEZsYXNoY2FyZHMobm90ZSwgdGFnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgb3V0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzb3J0IHRoZSBkZWNrIG5hbWVzXHJcbiAgICAgICAgdGhpcy5kZWNrVHJlZS5zb3J0U3ViZGVja3NMaXN0KCk7XHJcblxyXG4gICAgICAgIGxldCBub3RlQ291bnRUZXh0OiBzdHJpbmcgPSB0aGlzLmR1ZU5vdGVzQ291bnQgPT0gMSA/IFwibm90ZVwiIDogXCJub3Rlc1wiO1xyXG4gICAgICAgIGxldCBjYXJkQ291bnRUZXh0OiBzdHJpbmcgPVxyXG4gICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmR1ZUZsYXNoY2FyZHNDb3VudCA9PSAxID8gXCJjYXJkXCIgOiBcImNhcmRzXCI7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNCYXIuc2V0VGV4dChcclxuICAgICAgICAgICAgYFJldmlldzogJHt0aGlzLmR1ZU5vdGVzQ291bnR9ICR7bm90ZUNvdW50VGV4dH0sICR7dGhpcy5kZWNrVHJlZS5kdWVGbGFzaGNhcmRzQ291bnR9ICR7Y2FyZENvdW50VGV4dH0gZHVlYFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMuZmxhc2hjYXJkc1N5bmNMb2NrID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZmluZEZsYXNoY2FyZHMobm90ZTogVEZpbGUsIGRlY2tQYXRoU3RyOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZmlsZVRleHQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKG5vdGUpO1xyXG4gICAgICAgIGxldCBmaWxlQ2FjaGVkRGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKG5vdGUpIHx8IHt9O1xyXG4gICAgICAgIGxldCBoZWFkaW5ncyA9IGZpbGVDYWNoZWREYXRhLmhlYWRpbmdzIHx8IFtdO1xyXG4gICAgICAgIGxldCBmaWxlQ2hhbmdlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgZGVja0FkZGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGRlY2tQYXRoOiBzdHJpbmdbXSA9IGRlY2tQYXRoU3RyLnN1YnN0cmluZygxKS5zcGxpdChcIi9cIik7XHJcbiAgICAgICAgaWYgKGRlY2tQYXRoLmxlbmd0aCA9PSAxICYmIGRlY2tQYXRoWzBdID09IFwiXCIpIGRlY2tQYXRoID0gW1wiL1wiXTtcclxuXHJcbiAgICAgICAgLy8gZmluZCBhbGwgY29kZWJsb2Nrc1xyXG4gICAgICAgIGxldCBjb2RlYmxvY2tzOiBbbnVtYmVyLCBudW1iZXJdW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCByZWdleCBvZiBbQ09ERUJMT0NLX1JFR0VYLCBJTkxJTkVfQ09ERV9SRUdFWF0pIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbWF0Y2ggb2YgZmlsZVRleHQubWF0Y2hBbGwocmVnZXgpKVxyXG4gICAgICAgICAgICAgICAgY29kZWJsb2Nrcy5wdXNoKFttYXRjaC5pbmRleCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGhdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIC8vIGJhc2ljIGNhcmRzXHJcbiAgICAgICAgZm9yIChsZXQgcmVnZXggb2YgW3RoaXMuc2luZ2xlbGluZUNhcmRSZWdleCwgdGhpcy5tdWx0aWxpbmVDYXJkUmVnZXhdKSB7XHJcbiAgICAgICAgICAgIGxldCBjYXJkVHlwZTogQ2FyZFR5cGUgPVxyXG4gICAgICAgICAgICAgICAgcmVnZXggPT0gdGhpcy5zaW5nbGVsaW5lQ2FyZFJlZ2V4XHJcbiAgICAgICAgICAgICAgICAgICAgPyBDYXJkVHlwZS5TaW5nbGVMaW5lQmFzaWNcclxuICAgICAgICAgICAgICAgICAgICA6IENhcmRUeXBlLk11bHRpTGluZUJhc2ljO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBmaWxlVGV4dC5tYXRjaEFsbChyZWdleCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICBpbkNvZGVibG9jayhtYXRjaC5pbmRleCwgbWF0Y2hbMF0udHJpbSgpLmxlbmd0aCwgY29kZWJsb2NrcylcclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWRlY2tBZGRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVja1RyZWUuY3JlYXRlRGVjayhbLi4uZGVja1BhdGhdKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWNrQWRkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBjYXJkVGV4dCA9IG1hdGNoWzBdLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZnJvbnQgPSBtYXRjaFsxXS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgYmFjayA9IG1hdGNoWzJdLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIGxldCBjYXJkT2JqOiBDYXJkO1xyXG4gICAgICAgICAgICAgICAgLy8gZmxhc2hjYXJkIGFscmVhZHkgc2NoZWR1bGVkXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hbM10pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZHVlVW5peDogbnVtYmVyID0gd2luZG93XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tb21lbnQobWF0Y2hbM10sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWVlZWS1NTS1ERFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJERC1NTS1ZWVlZXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRkZCBNTU0gREQgWVlZWVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAudmFsdWVPZigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuRGF5czogbnVtYmVyID0gTWF0aC5jZWlsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZHVlVW5peCAtIG5vdykgLyAoMjQgKiAzNjAwICogMTAwMClcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHMuaGFzT3duUHJvcGVydHkobkRheXMpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmR1ZURhdGVzRmxhc2hjYXJkc1tuRGF5c10gPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHVlRGF0ZXNGbGFzaGNhcmRzW25EYXlzXSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuYnVyeUxpc3QuaW5jbHVkZXMoY3lyYjUzKGNhcmRUZXh0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNrVHJlZS5jb3VudEZsYXNoY2FyZChbLi4uZGVja1BhdGhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHVlVW5peCA8PSBub3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZE9iaiA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHBhcnNlSW50KG1hdGNoWzRdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2U6IHBhcnNlSW50KG1hdGNoWzVdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5QmVmb3JlUmV2aWV3OiBub3cgLSBkdWVVbml4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb250LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFjayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRUZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNrVHJlZS5pbnNlcnRGbGFzaGNhcmQoWy4uLmRlY2tQYXRoXSwgY2FyZE9iaik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNrVHJlZS5jb3VudEZsYXNoY2FyZChbLi4uZGVja1BhdGhdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXJkT2JqID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0R1ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb250LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNrVHJlZS5pbnNlcnRGbGFzaGNhcmQoWy4uLmRlY2tQYXRoXSwgY2FyZE9iaik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGdldFNldHRpbmcoXCJzaG93Q29udGV4dEluQ2FyZHNcIiwgdGhpcy5kYXRhLnNldHRpbmdzKSlcclxuICAgICAgICAgICAgICAgICAgICBhZGRDb250ZXh0VG9DYXJkKGNhcmRPYmosIG1hdGNoLmluZGV4LCBoZWFkaW5ncyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNsb3plIGRlbGV0aW9uIGNhcmRzXHJcbiAgICAgICAgaWYgKCFnZXRTZXR0aW5nKFwiZGlzYWJsZUNsb3plQ2FyZHNcIiwgdGhpcy5kYXRhLnNldHRpbmdzKSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBtYXRjaCBvZiBmaWxlVGV4dC5tYXRjaEFsbChDTE9aRV9DQVJEX0RFVEVDVE9SKSkge1xyXG4gICAgICAgICAgICAgICAgbWF0Y2hbMF0gPSBtYXRjaFswXS50cmltKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFkZWNrQWRkZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmNyZWF0ZURlY2soWy4uLmRlY2tQYXRoXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVja0FkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgY2FyZFRleHQgPSBtYXRjaFswXTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgZGVsZXRpb25zOiBSZWdFeHBNYXRjaEFycmF5W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG0gb2YgY2FyZFRleHQubWF0Y2hBbGwoQ0xPWkVfREVMRVRJT05TX0VYVFJBQ1RPUikpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluQ29kZWJsb2NrKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2guaW5kZXggKyBtLmluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbVswXS50cmltKCkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZWJsb2Nrc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGlvbnMucHVzaChtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBzY2hlZHVsaW5nOiBSZWdFeHBNYXRjaEFycmF5W10gPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uY2FyZFRleHQubWF0Y2hBbGwoQ0xPWkVfU0NIRURVTElOR19FWFRSQUNUT1IpLFxyXG4gICAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB3ZSBoYXZlIHNvbWUgZXh0cmEgc2NoZWR1bGluZyBkYXRlcyB0byBkZWxldGVcclxuICAgICAgICAgICAgICAgIGlmIChzY2hlZHVsaW5nLmxlbmd0aCA+IGRlbGV0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaWR4U2NoZWQgPSBjYXJkVGV4dC5sYXN0SW5kZXhPZihcIjwhLS1TUjpcIikgKyA3O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdDYXJkVGV4dCA9IGNhcmRUZXh0LnN1YnN0cmluZygwLCBpZHhTY2hlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWxldGlvbnMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0NhcmRUZXh0ICs9IGAhJHtzY2hlZHVsaW5nW2ldWzFdfSwke3NjaGVkdWxpbmdbaV1bMl19LCR7c2NoZWR1bGluZ1tpXVszXX1gO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0NhcmRUZXh0ICs9IFwiLS0+XFxuXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCByZXBsYWNlbWVudFJlZ2V4ID0gbmV3IFJlZ0V4cChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXNjYXBlUmVnZXhTdHJpbmcoY2FyZFRleHQpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImdtXCJcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVUZXh0ID0gZmlsZVRleHQucmVwbGFjZShyZXBsYWNlbWVudFJlZ2V4LCBuZXdDYXJkVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCByZWxhdGVkQ2FyZHM6IENhcmRbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWxldGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2FyZE9iajogQ2FyZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlbGV0aW9uU3RhcnQgPSBkZWxldGlvbnNbaV0uaW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlbGV0aW9uRW5kID0gZGVsZXRpb25TdGFydCArIGRlbGV0aW9uc1tpXVswXS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZyb250ID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFRleHQuc3Vic3RyaW5nKDAsIGRlbGV0aW9uU3RhcnQpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8c3BhbiBzdHlsZT0nY29sb3I6IzIxOTZmMyc+Wy4uLl08L3NwYW4+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkVGV4dC5zdWJzdHJpbmcoZGVsZXRpb25FbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZyb250ID0gZnJvbnQucmVwbGFjZSgvPT0vZ20sIFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBiYWNrID1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFRleHQuc3Vic3RyaW5nKDAsIGRlbGV0aW9uU3RhcnQpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8c3BhbiBzdHlsZT0nY29sb3I6IzIxOTZmMyc+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkVGV4dC5zdWJzdHJpbmcoZGVsZXRpb25TdGFydCwgZGVsZXRpb25FbmQpICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCI8L3NwYW4+XCIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkVGV4dC5zdWJzdHJpbmcoZGVsZXRpb25FbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2sgPSBiYWNrLnJlcGxhY2UoLz09L2dtLCBcIlwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FyZCBkZWxldGlvbiBzY2hlZHVsZWRcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHNjaGVkdWxpbmcubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkdWVVbml4OiBudW1iZXIgPSB3aW5kb3dcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tb21lbnQoc2NoZWR1bGluZ1tpXVsxXSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWVlZWS1NTS1ERFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiREQtTU0tWVlZWVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZU9mKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuRGF5czogbnVtYmVyID0gTWF0aC5jZWlsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGR1ZVVuaXggLSBub3cpIC8gKDI0ICogMzYwMCAqIDEwMDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHMuaGFzT3duUHJvcGVydHkobkRheXMpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHNbbkRheXNdID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kdWVEYXRlc0ZsYXNoY2FyZHNbbkRheXNdKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuYnVyeUxpc3QuaW5jbHVkZXMoY3lyYjUzKGNhcmRUZXh0KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVja1RyZWUuY291bnRGbGFzaGNhcmQoWy4uLmRlY2tQYXRoXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR1ZVVuaXggPD0gbm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXJkT2JqID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsOiBwYXJzZUludChzY2hlZHVsaW5nW2ldWzJdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNlOiBwYXJzZUludChzY2hlZHVsaW5nW2ldWzNdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxheUJlZm9yZVJldmlldzogbm93IC0gZHVlVW5peCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb250LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFRleHQ6IG1hdGNoWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFR5cGU6IENhcmRUeXBlLkNsb3plLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNhcmRJZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZENhcmRzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmluc2VydEZsYXNoY2FyZChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLi4uZGVja1BhdGhdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRPYmpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmNvdW50Rmxhc2hjYXJkKFsuLi5kZWNrUGF0aF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhLmJ1cnlMaXN0LmluY2x1ZGVzKGN5cmI1MyhjYXJkVGV4dCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmNvdW50Rmxhc2hjYXJkKFsuLi5kZWNrUGF0aF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5ldyBjYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRPYmogPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0R1ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZFRleHQ6IG1hdGNoWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dDogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRUeXBlOiBDYXJkVHlwZS5DbG96ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNhcmRJZHg6IGksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGVkQ2FyZHMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlY2tUcmVlLmluc2VydEZsYXNoY2FyZChbLi4uZGVja1BhdGhdLCBjYXJkT2JqKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlbGF0ZWRDYXJkcy5wdXNoKGNhcmRPYmopO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRTZXR0aW5nKFwic2hvd0NvbnRleHRJbkNhcmRzXCIsIHRoaXMuZGF0YS5zZXR0aW5ncykpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZENvbnRleHRUb0NhcmQoY2FyZE9iaiwgbWF0Y2guaW5kZXgsIGhlYWRpbmdzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGZpbGVDaGFuZ2VkKSBhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkobm90ZSwgZmlsZVRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxvYWRQbHVnaW5EYXRhKCkge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfREFUQSwgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzYXZlUGx1Z2luRGF0YSgpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFZpZXcoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoUkVWSUVXX1FVRVVFX1ZJRVdfVFlQRSkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRSaWdodExlYWYoZmFsc2UpLnNldFZpZXdTdGF0ZSh7XHJcbiAgICAgICAgICAgIHR5cGU6IFJFVklFV19RVUVVRV9WSUVXX1RZUEUsXHJcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWRkQ29udGV4dFRvQ2FyZChcclxuICAgIGNhcmRPYmo6IENhcmQsXHJcbiAgICBjYXJkT2Zmc2V0OiBudW1iZXIsXHJcbiAgICBoZWFkaW5nczogSGVhZGluZ0NhY2hlW11cclxuKTogdm9pZCB7XHJcbiAgICBsZXQgc3RhY2s6IEhlYWRpbmdDYWNoZVtdID0gW107XHJcbiAgICBmb3IgKGxldCBoZWFkaW5nIG9mIGhlYWRpbmdzKSB7XHJcbiAgICAgICAgaWYgKGhlYWRpbmcucG9zaXRpb24uc3RhcnQub2Zmc2V0ID4gY2FyZE9mZnNldCkgYnJlYWs7XHJcblxyXG4gICAgICAgIHdoaWxlIChcclxuICAgICAgICAgICAgc3RhY2subGVuZ3RoID4gMCAmJlxyXG4gICAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5sZXZlbCA+PSBoZWFkaW5nLmxldmVsXHJcbiAgICAgICAgKVxyXG4gICAgICAgICAgICBzdGFjay5wb3AoKTtcclxuXHJcbiAgICAgICAgc3RhY2sucHVzaChoZWFkaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBoZWFkaW5nT2JqIG9mIHN0YWNrKSBjYXJkT2JqLmNvbnRleHQgKz0gaGVhZGluZ09iai5oZWFkaW5nICsgXCIgPiBcIjtcclxuICAgIGNhcmRPYmouY29udGV4dCA9IGNhcmRPYmouY29udGV4dC5zbGljZSgwLCAtMyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluQ29kZWJsb2NrKFxyXG4gICAgbWF0Y2hTdGFydDogbnVtYmVyLFxyXG4gICAgbWF0Y2hMZW5ndGg6IG51bWJlcixcclxuICAgIGNvZGVibG9ja3M6IFtudW1iZXIsIG51bWJlcl1bXVxyXG4pIHtcclxuICAgIGZvciAobGV0IGNvZGVibG9jayBvZiBjb2RlYmxvY2tzKSB7XHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBtYXRjaFN0YXJ0ID49IGNvZGVibG9ja1swXSAmJlxyXG4gICAgICAgICAgICBtYXRjaFN0YXJ0ICsgbWF0Y2hMZW5ndGggPD0gY29kZWJsb2NrWzFdXHJcbiAgICAgICAgKVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG4iXSwibmFtZXMiOlsiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciLCJOb3RpY2UiLCJNb2RhbCIsIlBsYXRmb3JtIiwiTWFya2Rvd25SZW5kZXJlciIsIlRGaWxlIiwiSXRlbVZpZXciLCJNZW51IiwiUGx1Z2luIiwiYWRkSWNvbiIsImdyYXBoLnJlc2V0IiwiZ3JhcGgubGluayIsImdldEFsbFRhZ3MiLCJncmFwaC5yYW5rIl0sIm1hcHBpbmdzIjoiOzs7O0FBRUEsU0FBUyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUNsQyxJQUFJLElBQUksQ0FBQyxPQUFPLE1BQU0sS0FBSyxRQUFRLE1BQU0sT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDLEVBQUU7QUFDMUUsUUFBUSxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtBQUNoQyxZQUFZLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDckQsZ0JBQWdCLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDMUQsb0JBQW9CLE1BQU07QUFDMUIsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYixTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRDtJQUNBLEdBQWMsR0FBRyxDQUFDLFlBQVk7QUFDOUIsSUFBSSxJQUFJLElBQUksR0FBRztBQUNmLFFBQVEsS0FBSyxFQUFFLENBQUM7QUFDaEIsUUFBUSxLQUFLLEVBQUUsRUFBRTtBQUNqQixRQUFRLEtBQUssRUFBRSxFQUFFO0FBQ2pCLEtBQUssQ0FBQztBQUNO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
