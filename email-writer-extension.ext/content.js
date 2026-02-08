console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}


function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();

            // Send request to background service worker to avoid page CORS
            const payload = {
                type: 'generate',
                emailContent: emailContent,
                tone: 'professional'
            };

            const response = await new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage(payload, (res) => resolve(res));
                } else if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
                    browser.runtime.sendMessage(payload).then((res) => resolve(res));
                } else {
                    resolve({ ok: false, message: 'Runtime messaging unavailable' });
                }
            });

            if (!response || !response.ok) {
                throw new Error(response && response.message ? response.message : 'API Request Failed');
            }

            const generatedReply = response.text || '';
            const composeBox = document.querySelector('[role="textbox"][contenteditable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
                alert('Compose box was not found');
            }
        } catch (error) {
            console.error('Generate error:', error);
            alert('Failed to generate reply: ' + (error.message || error));
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled =  false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});