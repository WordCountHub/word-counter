function countWords() {

    let text = document.getElementById("text").value.trim();


    if (text === "") {

        document.getElementById("wordCount").textContent = "0";

        document.getElementById("characterCount").textContent = "0";

        document.getElementById("sentenceCount").textContent = "0";

        document.getElementById("paragraphCount").textContent = "0";

        return;
    }


    // Count words

    let words = text.split(/\s+/).filter(word => word.length > 0);

    let wordCount = words.length;


    // Count characters

    let characterCount = text.length;


    // Count sentences

    let sentences = text
        .split(/[.!?]+/)
        .filter(sentence => sentence.trim().length > 0);

    let sentenceCount = sentences.length;


    // Count paragraphs

    let paragraphs = text
        .split(/\n+/)
        .filter(paragraph => paragraph.trim().length > 0);

    let paragraphCount = paragraphs.length;


    // Display results

    document.getElementById("wordCount").textContent = wordCount;

    document.getElementById("characterCount").textContent = characterCount;

    document.getElementById("sentenceCount").textContent = sentenceCount;

    document.getElementById("paragraphCount").textContent = paragraphCount;

}


function clearText() {

    document.getElementById("text").value = "";

    countWords();

}
