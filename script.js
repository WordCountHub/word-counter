function countWords() {

    let text = document.getElementById("text").value.trim();

    if (text === "") {

        document.getElementById("result").innerHTML =
            "Please enter some text.";

        return;
    }

    let words = text.split(/\s+/).length;

    let characters = text.length;

    document.getElementById("result").innerHTML =
        "Words: " + words +
        "<br>Characters: " + characters;
}
