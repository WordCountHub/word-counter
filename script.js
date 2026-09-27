```javascript
"use strict";


/* =========================================
   WORDCOUNT HUB
   WORD COUNTER SCRIPT
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const textInput =
    document.getElementById("textInput");

const wordCountElement =
    document.getElementById("wordCount");

const characterCountElement =
    document.getElementById("characterCount");

const characterNoSpaceElement =
    document.getElementById("characterNoSpaceCount");

const sentenceCountElement =
    document.getElementById("sentenceCount");

const paragraphCountElement =
    document.getElementById("paragraphCount");

const readingTimeElement =
    document.getElementById("readingTime");

const speakingTimeElement =
    document.getElementById("speakingTime");

const wordLimitInput =
    document.getElementById("wordLimit");

const clearLimitButton =
    document.getElementById("clearLimit");

const limitStatus =
    document.getElementById("limitStatus");

const copyButton =
    document.getElementById("copyButton");

const downloadButton =
    document.getElementById("downloadButton");

const clearButton =
    document.getElementById("clearButton");

const actionMessage =
    document.getElementById("actionMessage");


/* =========================================
   AVERAGE READING / SPEAKING SPEED
========================================= */

const READING_WORDS_PER_MINUTE = 200;

const SPEAKING_WORDS_PER_MINUTE = 130;


/* =========================================
   GET WORDS
========================================= */

function getWords(text) {

    if (!text.trim()) {
        return [];
    }


    return text.match(
        /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    ) || [];
}


/* =========================================
   COUNT SENTENCES
========================================= */

function getSentenceCount(text) {

    if (!text.trim()) {
        return 0;
    }


    const sentences = text
        .split(/[.!?]+(?:\s|$)/)
        .filter(
            sentence =>
                sentence.trim().length > 0
        );


    return sentences.length;
}


/* =========================================
   COUNT PARAGRAPHS
========================================= */

function getParagraphCount(text) {

    if (!text.trim()) {
        return 0;
    }


    return text
        .split(/\n\s*\n|\n/)
        .filter(
            paragraph =>
                paragraph.trim().length > 0
        )
        .length;
}


/* =========================================
   FORMAT TIME
========================================= */

function formatMinutes(minutes) {

    if (minutes <= 0) {
        return "0 min";
    }


    if (minutes < 1) {
        return "<1 min";
    }


    return `${Math.ceil(minutes)} min`;
}


/* =========================================
   CALCULATE STATISTICS
========================================= */

function calculateStatistics() {

    const text =
        textInput.value;


    /* Words */

    const words =
        getWords(text);

    const wordCount =
        words.length;


    /* Characters */

    const characterCount =
        [...text].length;


    /* Characters without spaces */

    const characterNoSpaceCount =
        [...text]
            .filter(
                character =>
                    !/\s/u.test(character)
            )
            .length;


    /* Sentences */

    const sentenceCount =
        getSentenceCount(text);


    /* Paragraphs */

    const paragraphCount =
        getParagraphCount(text);


    /* Reading time */

    const readingMinutes =
        wordCount /
        READING_WORDS_PER_MINUTE;


    /* Speaking time */

    const speakingMinutes =
        wordCount /
        SPEAKING_WORDS_PER_MINUTE;


    /* =========================================
       UPDATE SCREEN
    ========================================= */

    wordCountElement.textContent =
        wordCount.toLocaleString();


    characterCountElement.textContent =
        characterCount.toLocaleString();


    characterNoSpaceElement.textContent =
        characterNoSpaceCount.toLocaleString();


    sentenceCountElement.textContent =
        sentenceCount.toLocaleString();


    paragraphCountElement.textContent =
        paragraphCount.toLocaleString();


    readingTimeElement.textContent =
        formatMinutes(readingMinutes);


    speakingTimeElement.textContent =
        formatMinutes(speakingMinutes);


    /* Word limit */

    updateWordLimit(wordCount);
}


/* =========================================
   WORD LIMIT
========================================= */

function updateWordLimit(wordCount) {

    const value =
        wordLimitInput.value.trim();


    if (!value) {

        limitStatus.textContent =
            "";

        limitStatus.className =
            "limit-status";

        return;
    }


    const limit =
        Number(value);


    if (
        !Number.isFinite(limit) ||
        limit <= 0
    ) {

        limitStatus.textContent =
            "Please enter a valid word limit.";

        limitStatus.className =
            "limit-status limit-warning";

        return;
    }


    const remaining =
        limit - wordCount;


    if (remaining > 0) {

        limitStatus.textContent =
            `${remaining.toLocaleString()} words remaining out of ${limit.toLocaleString()}.`;

        limitStatus.className =
            "limit-status limit-success";

    }

    else if (remaining === 0) {

        limitStatus.textContent =
            `You have reached your ${limit.toLocaleString()}-word limit.`;

        limitStatus.className =
            "limit-status limit-success";

    }

    else {

        const exceeded =
            Math.abs(remaining);


        limitStatus.textContent =
            `You are ${exceeded.toLocaleString()} words over your ${limit.toLocaleString()}-word limit.`;

        limitStatus.className =
            "limit-status limit-error";
    }
}


/* =========================================
   CLEAR TEXT
========================================= */

function clearText() {

    textInput.value =
        "";

    calculateStatistics();

    showMessage(
        "Text cleared.",
        "success"
    );

    textInput.focus();
}


/* =========================================
   COPY TEXT
========================================= */

async function copyText() {

    const text =
        textInput.value;


    if (!text.trim()) {

        showMessage(
            "There is no text to copy.",
            "error"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(text);


        showMessage(
            "Text copied to your clipboard.",
            "success"
        );

    }

    catch (error) {

        textInput.select();


        try {

            document.execCommand("copy");


            showMessage(
                "Text copied to your clipboard.",
                "success"
            );

        }

        catch (fallbackError) {

            showMessage(
                "Unable to copy the text. Please copy it manually.",
                "error"
            );
        }


        window.getSelection()?.removeAllRanges();
    }
}


/* =========================================
   DOWNLOAD TEXT
========================================= */

function downloadText() {

    const text =
        textInput.value;


    if (!text.trim()) {

        showMessage(
            "There is no text to download.",
            "error"
        );

        return;
    }


    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "wordcounthub-text.txt";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    showMessage(
        "Text downloaded successfully.",
        "success"
    );
}


/* =========================================
   SHOW MESSAGE
========================================= */

let messageTimer;


function showMessage(message, type) {

    clearTimeout(messageTimer);


    actionMessage.textContent =
        message;


    actionMessage.className =
        `action-message ${type}`;


    messageTimer =
        setTimeout(
            () => {

                actionMessage.textContent =
                    "";

                actionMessage.className =
                    "action-message";

            },
            3000
        );
}


/* =========================================
   CLEAR WORD LIMIT
========================================= */

function clearWordLimit() {

    wordLimitInput.value =
        "";

    calculateStatistics();

    wordLimitInput.focus();
}


/* =========================================
   WORD LIMIT INPUT
========================================= */

wordLimitInput.addEventListener(
    "input",
    function () {

        if (this.value < 0) {
            this.value = 0;
        }

        calculateStatistics();
    }
);


/* =========================================
   TEXT INPUT
========================================= */

textInput.addEventListener(
    "input",
    calculateStatistics
);


/* =========================================
   BUTTON EVENTS
========================================= */

clearButton.addEventListener(
    "click",
    clearText
);


copyButton.addEventListener(
    "click",
    copyText
);


downloadButton.addEventListener(
    "click",
    downloadText
);


clearLimitButton.addEventListener(
    "click",
    clearWordLimit
);


/* =========================================
   INITIAL CALCULATION
========================================= */

calculateStatistics();
```
