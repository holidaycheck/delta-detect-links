import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import { Delta } from 'rich-text';

const punctuator = '!';

function getOperationText(op) {
    if (typeof op.insert === 'string') {
        if (op.attributes && op.attributes.link) {
            return (new Array(op.insert.length + 1)).join(punctuator);
        }
        return op.insert;
    }
    return punctuator;
}

const linkify = linkifyIt()
    .tlds(tlds)
    .add('ftp:', null)
    .add('mailto:', null)
    .set({ fuzzLink: true })
    .set({ fuzzyIP: false })
    .set({ fuzzyEmail: false });

function isTrailingLinkMatch(link, lastIndex, text) {
    const lastCharacter = text[lastIndex - 1];

    if (lastIndex < link.lastIndex) {
        return true;
    }

    if (lastCharacter === '.') {
        return link.lastIndex === lastIndex - 1;
    }

    return link.lastIndex === lastIndex;
}
function detectLinksDelta(delta, options = {}) {
    const text = delta.ops.reduce((result, operation) => result + getOperationText(operation), '');
    const matchedLinks = linkify.match(text) || [];
    let currentIndex = 0;
    const links = new Delta();

    matchedLinks.forEach(function (link) {
        const numberOfCharactersToLinkStart = link.index - currentIndex;
        const linkTextLength = link.lastIndex - link.index;

        links.retain(numberOfCharactersToLinkStart);

        if (options.skipTrailingMatch && isTrailingLinkMatch(link, options.lastIndex, text)) {
            links.retain(linkTextLength);
        } else {
            links.retain(linkTextLength, { link: link.url });
        }

        currentIndex = link.lastIndex;
    });

    return links;
}

export default function detectLinks(delta, options = {}) {
    const links = detectLinksDelta(delta, options);

    return delta.compose(links);
}

detectLinks.detectLinksDelta = detectLinksDelta;
