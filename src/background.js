const tinycolor = require("tinycolor2");

let userTheme;

const themes = {};

browser.theme.getCurrent().then((theme) => {
    userTheme = theme;
});

async function setFrame(message, sender) {
    if (!message.themeColor || !userTheme) {
        return;
    }

    if (!sender.tab) {
        browser.theme.update(sender.tab.windowId, userTheme);
        return;
    }

    let themeColor = tinycolor(message.themeColor)
    const isLight = themeColor.isLight()

    if (isLight) {
        const luminance = themeColor.getLuminance();
        themeColor.darken(luminance * 75)
    }

    if (tinycolor.equals((await browser.theme.getCurrent()).colors.frame, themeColor)) {
        return;
    }

    themeColor = themeColor.toHexString()

    const theme = JSON.parse(JSON.stringify(userTheme));

    theme.colors.frame = themeColor;

    theme.colors.tab_selected = tinycolor(themeColor).brighten(10).toString();
    theme.colors.tab_line = tinycolor(themeColor).brighten(10).toString();

    theme.colors.toolbar = tinycolor(themeColor).brighten(7).toString();
    theme.colors.toolbar_field = themeColor;
    theme.colors.toolbar_field_focus = tinycolor(themeColor).brighten(15).toString();

    if (isLight) {
        theme.colors.toolbar_top_separator = tinycolor(themeColor).lighten(10).toString();
        theme.colors.toolbar_bottom_separator = tinycolor(themeColor).lighten(10).toString();
    } else {
        theme.colors.toolbar_top_separator = tinycolor(themeColor).darken(10).toString();
        theme.colors.toolbar_bottom_separator = tinycolor(themeColor).darken(10).toString();
    }

    theme.colors.popup = tinycolor(themeColor).brighten(15).toString();
    theme.colors.popup_border = tinycolor(themeColor).brighten(25).toString();
    theme.colors.popup_highlight = tinycolor(themeColor).brighten(10).toString();

    themes[sender.tab.id] = theme;

    if (sender.tab.active) {
        browser.theme.update(sender.tab.windowId, theme);
    }
}

async function handleTabActivated(activeInfo) {
    const theme = themes[activeInfo.tabId];
    browser.theme.update(activeInfo.windowId, theme || userTheme);
}

async function handleTabRemoved(tabId) {
    delete themes[tabId];
}

browser.runtime.onMessage.addListener(setFrame);
browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onRemoved.addListener(handleTabRemoved);
