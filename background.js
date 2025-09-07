chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openMainScreen') {
        chrome.windows.create({
            url: 'main.html',
            type: 'popup',
            width: 260,
            height: 400
        }, (window) => {
            // Once the window is created, store the initial screen state
            // and pass it to the new window.
            chrome.runtime.onMessage.addListener(function handler(msg) {
                if (msg.action === "ready") {
                    chrome.tabs.sendMessage(window.tabs[0].id, {
                        action: 'showScreen',
                        screen: request.screen
                    });
                    chrome.runtime.onMessage.removeListener(handler);
                }
            });
        });
    }
});
