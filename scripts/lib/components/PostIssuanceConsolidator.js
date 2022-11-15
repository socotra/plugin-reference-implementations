/**
 * A sample implementation of the post-issuance consolidator, which yields a single
 * consolidated document.
 *
 * If you want a single consolidated document, you can pass in options; else,
 * you will need to write a new implementation.
 */

const DEFAULT_OPTIONS = {
    consolidatedDisplayName: "Consolidated Document",
    consolidatedFileName: "consolidated.pdf",
    deleteSourceDocuments: true,
    strategy: (data) => data.documents.map(d => d.locator)
}

class PostIssuanceConsolidator {
    VERSION = '1.2';

    constructor(data, options = {}) {
        this.data = data;
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    getPostIssuanceResult() {
        return {
            documentConsolidations: [{
                displayName: this.options.consolidatedDisplayName,
                documentLocators: this.options.strategy(this.data),
                fileName: this.options.consolidatedFileName,
                deleteSourceDocuments: this.options.deleteSourceDocuments
            }]
        };
    }
}

module.exports = {
    PostIssuanceConsolidator
}
