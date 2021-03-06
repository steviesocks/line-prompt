export const findCurrentWord = (script, speechResult, wordIndex = { start: 0, end: 0 }) => {
    const resultArr = speechResult.toLowerCase().split(" ");
    const text = script.toLowerCase();
    const lastWord = resultArr[resultArr.length - 1];
    const matchIndex = text.indexOf(lastWord, wordIndex.start);
    if (matchIndex >= 0 && matchIndex < wordIndex.start + 100) {
        const newWordIndex = {
            start: matchIndex,
            end: matchIndex + lastWord.length
        };
        return newWordIndex;
    } else if (resultArr.length > 1) {
        const penultimateWord = resultArr[resultArr.length - 2];
        const matchIndex2 = text.indexOf(penultimateWord, wordIndex.start);
        if (matchIndex2 >= 0 && matchIndex2 < wordIndex.start + 100) {
            const newWordIndex = {
                start: matchIndex2,
                end: matchIndex2 + penultimateWord.length
            };
            return newWordIndex;
        }
    }
    return wordIndex;
};

