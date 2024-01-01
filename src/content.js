const tinycolor = require("tinycolor2");

async function sendThemeColor() {
    let method;
    let color = document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute("content");

    const bodyColor = getElementColor(document.querySelector("body"), true)
    if (bodyColor) {
        color = bodyColor;
        method = "BODY"
    }

    const navColor = getElementColor(document.querySelector("nav"))
    if (navColor) {
        color = navColor;
        method = "NAV"
    }

    const header = document.querySelector("header")
    const headerStyle = header
        ? window.getComputedStyle(header)
        : null;

    if (header) {
        if (isOpaque(headerStyle.backgroundColor)) {
            color = headerStyle.backgroundColor;
            method = "HEADER"
        } else if (getInheritedColor(header, 1)) {
            color = getInheritedColor(header, 1)
            method = "HEADER_INHERITANCE"
        } else {
            let element = document.elementFromPoint(window.innerWidth / 2, 3)
            if (element.tagName != "HEADER" && getInheritedColor(element)) {
                color = getInheritedColor(element)
                method = "TOP"
            }
        }
    }

    console.debug("method:", method)

    if (color != null) {
        browser.runtime.sendMessage({ themeColor: color });
    } else {
        console.log("no theme-color found")
    }
}

function isOpaque(color) {
    return tinycolor(color).getAlpha() >= 0.8
}

function getElementColor(element, allowTransparent) {
    let elementStyle = element
        ? window.getComputedStyle(element)
        : null;

    if (elementStyle) {
        if (isOpaque(elementStyle.backgroundColor) || allowTransparent) {
            return elementStyle.backgroundColor;
        }
    }

    return null;
}

function debounce(func, timeout = 250) {
    let ready = true;
    
    return function(args) {
        if (!ready) return

        func.call(this, args)

        ready = false

        setTimeout(() => {
            ready = true
        }, timeout);
    };
};

function getInheritedColor(element, maxDepth = 10) {
    let topColor = "#00000000";
    let depth = 0

    for (element; element && depth < maxDepth; element = element.parentElement) {
        if (isOpaque(topColor)) break;

        let elementColor = window
            .getComputedStyle(element)
            .backgroundColor

        if (!isOpaque(elementColor)
            || element.offsetHeight < 20
            || element.offsetWidth < window.innerWidth * 0.9) {
            depth++;
            continue;
        }

        topColor = elementColor;
    }

    if (isOpaque(topColor)) {
        return topColor
    }

    return null
}

const sendThemeColorDebounced = debounce(sendThemeColor, 250)

// browser.runtime.onMessage.addListener(sendThemeColorDebounced)
sendThemeColor()
window.addEventListener("pageshow", sendThemeColor)
document.addEventListener("visibilitychange", sendThemeColor)

document.addEventListener("resize", sendThemeColorDebounced)
document.addEventListener("scroll", sendThemeColorDebounced)
document.addEventListener("scrollend", sendThemeColorDebounced)
document.addEventListener("click", sendThemeColorDebounced)
document.addEventListener("animationend", sendThemeColorDebounced)
document.addEventListener("animationcancel", sendThemeColorDebounced)
document.addEventListener("transitionend", sendThemeColorDebounced)
document.addEventListener("transitioncancel", sendThemeColorDebounced)

