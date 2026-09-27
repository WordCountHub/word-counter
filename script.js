"use strict";

/*
 * WordCountHub Word Counter
 * All calculations are performed locally in the browser.
 */

const textInput = document.getElementById("textInput");

const wordCountElement = document.getElementById("wordCount");
const characterCountElement = document.getElementById("characterCount");
const characterNoSpaceElement = document.getElementById("characterNoSpaceCount");
const sentenceCountElement = document.getElementById("sentenceCount");
const paragraphCountElement = document.getElementById("paragraphCount");
const readingTimeElement = document.getElementById("readingTime");
const speakingTimeElement = document.getElementById("speakingTime");

const wordLimitInput = document.getElementById("wordLimit");
const clearLimitButton = document.getElementById("clearLimit");

const limitStatus = document.getElementById("limitStatus");

const copyButton = document.getElementById("copyButton");
const downloadButton = document.getElementById("downloadButton");
const clearButton = document.getElementById("clearButton");

const actionMessage = document.getElementById("actionMessage");


/*
 * Average reading and speaking speeds.
 * These are estimates, not exact measurements.
 */
const READING_WORDS_PER_MINUTE = 200;
const SPEAKING_WORDS_PER_MINUTE = 130;


/*
 * Get words from text.
 *
 * This handles Unicode letters/numbers and common
 * apostrophes/hyphens better than a simple split(/\s+/).
 */
function getWords(text) {
    if (!text.trim()) {
        return [];
    }

    return text.match(
        /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    ) || [];
}


/*
 * Count sentences.
 */
function getSentenceCount(text) {
    if (!text.trim()) {
        return 0;
    }

    const sentences = text
        .split(/[.!?]+(?:\s|$)/)
        .filter(sentence => sentence.trim().length > 0);

    return sentences.length;
}


/*
 * Count paragraphs.
 */
function getParagraphCount(text) {
    if (!text.trim()) {
        return 0;
    }

    return text
        .split(/\n\s*\n|\n/)
        .filter(paragraph => paragraph.trim().length > 0)
        .length;
}


/*
 * Format time.
 *
 * Example:
 * 0 words -> 0 min
 * 250 words -> 2 min
 * 1000 words -> 5 min
 */
function formatMinutes(minutes) {
    if (minutes <= 0) {
        return "0 min";
    }

    if (minutes < 1) {
        return "<1 min";
    }

    return `${Math.ceil(minutes)} min`;
}


/*
 * Calculate all statistics.
 */
function calculateStatistics() {
    const text = textInput.value;

    const words = getWords(text);
    const wordCount = words.length;

    const characterCount = [...text].length;

    const characterNoSpaceCount = [...text]
        .filter(character => !/\s/u.test(character))
        .length;

    const sentenceCount = getSentenceCount(text);

    const paragraphCount = getParagraphCount(text);

    const readingMinutes =
        wordCount / READING_WORDS_PER_MINUTE;

    const speakingMinutes =
        wordCount / SPEAKING_WORDS_PER_MINUTE;


    /*
     * Update UI.
     */
    wordCountElement.textContent = wordCount.toLocaleString();

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


    /*
     * Update word limit.
     */
    updateWordLimit(wordCount);
}


/*
 * Check word limit.
 */
function updateWordLimit(wordCount) {
    const limitValue = wordLimitInput.value.trim();

    if (!limitValue) {
        limitStatus.textContent = "";
        limitStatus.className = "limit-status";
        return;
    }

    const limit = Number(limitValue);

    if (!Number.isFinite(limit) || limit <= 0) {
        limitStatus.textContent = "Enter a valid word limit.";
        limitStatus.className =
            "limit-status limit-warning";
        return;
    }

    const remaining = limit - wordCount;

    if (remaining > 0) {
        limitStatus.textContent =
            `${remaining.toLocaleString()} words remaining out of ${limit.toLocaleString()}.`;

        limitStatus.className =
            "limit-status limit-success";

    } else if (remaining === 0) {
        limitStatus.textContent =
            `You have reached your ${limit.toLocaleString()}-word limit.`;

        limitStatus.className =
            "limit-status limit-success";

    } else {
        const exceeded = Math.abs(remaining);

        limitStatus.textContent =
            `You are ${exceeded.toLocaleString()} words over your ${limit.toLocaleString()}-word limit.`;

        limitStatus.className =
            "limit-status limit-error";
    }
}


/*
 * Clear the text.
 */
function clearText() {
    textInput.value = "";

    calculateStatistics();

    showMessage("Text cleared.", "success");

    textInput.focus();
}


/*
 * Copy text to clipboard.
 */
async function copyText() {
    const text = textInput.value;

    if (!text.trim()) {
        showMessage("There is no text to copy.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);

        showMessage(
            "Text copied to your clipboard.",
            "success"
        );

    } catch (error) {

        /*
         * Fallback for older browsers.
         */
        textInput.select();

        try {
            document.execCommand("copy");

            showMessage(
                "Text copied to your clipboard.",
                "success"
            );

        } catch (fallbackError) {

            showMessage(
                "Unable to copy the text. Please copy it manually.",
                "error"
            );
        }

        window.getSelection()?.removeAllRanges();
    }
}


/*
 * Download text as a .txt file.
 */
function downloadText() {
    const text = textInput.value;

    if (!text.trim()) {
        showMessage(
            "There is no text to download.",
            "error"
        );

        return;
    }

    const blob = new Blob(
        [text],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "wordcounthub-text.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage(
        "Text downloaded successfully.",
        "success"
    );
}


/*
 * Show a temporary status message.
 */
let messageTimer;

function showMessage(message, type) {
    clearTimeout(messageTimer);

    actionMessage.textContent = message;

    actionMessage.className =
        `action-message ${type}`;

    messageTimer = setTimeout(() => {
        actionMessage.textContent = "";
        actionMessage.className = "action-message";
    }, 3000);
}


/*
 * Clear word limit.
 */
function clearWordLimit() {
    wordLimitInput.value = "";

    calculateStatistics();

    wordLimitInput.focus();
}


/*
 * Allow only reasonable numeric input.
 */
wordLimitInput.addEventListener(
    "input",
    function () {

        /*
         * Prevent negative numbers.
         */
        if (this.value < 0) {
            this.value = 0;
        }

        calculateStatistics();
    }
);


/*
 * Main text input listener.
 *
 * Statistics update automatically while typing.
 */
textInput.addEventListener(
    "input",
    calculateStatistics
);


/*
 * Button events.
 */
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


/*
 * Keyboard shortcut:
 *
 * Ctrl + Enter / Cmd + Enter
 * focuses the word counter statistics.
 */
textInput.addEventListener(
    "keydown",
    function (event) {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {
            event.preventDefault();

            wordCountElement.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }
);


/*
 * Initial calculation.
 */
calculateStatistics();
