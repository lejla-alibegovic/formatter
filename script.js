document.getElementById('convertButton').addEventListener('click', function() {
    const input = document.getElementById('inputField').value;
    let formattedOutput;

    try {
        const decodedInput = decodeHTMLEntities(input);
        formattedOutput = formatJSON(decodedInput);

        if (!formattedOutput) {
            formattedOutput = formatXML(decodedInput);
        }

        if (!formattedOutput) {
            throw new Error('Input is neither valid JSON nor XML.');
        }
    } catch (e) {
        formattedOutput = 'Invalid input. Please provide valid HTML-encoded JSON or XML.';
    }

    document.getElementById('outputField').textContent = formattedOutput;
});

function decodeHTMLEntities(text) {
    const element = document.createElement('textarea');
    element.innerHTML = text;
    return element.value;
}

function formatJSON(jsonString) {
    try {
        const jsonObject = JSON.parse(jsonString);
        return JSON.stringify(jsonObject, null, 4);
    } catch (e) {
        return null;
    }
}

function formatXML(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length) {
            throw new Error('Error parsing XML');
        }

        const xsltProcessor = new XSLTProcessor();
        const xslDoc = parser.parseFromString([
            '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
            '<xsl:output method="xml" indent="yes"/>',
            '<xsl:template match="node()|@*">',
            '<xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
            '</xsl:template>',
            '</xsl:stylesheet>'
        ].join('\n'), 'application/xml');

        xsltProcessor.importStylesheet(xslDoc);
        const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
        const serializer = new XMLSerializer();
        return serializer.serializeToString(resultDoc);
    } catch (e) {
        return null;
    }
}
