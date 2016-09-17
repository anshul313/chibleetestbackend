var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: '52.77.1.79:9200',
    log: 'info'
});


var indexName = "cb";

function getSuggestions(input) {  
    return elasticClient.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    field: "suggest",
                    fuzzy: true
                }
            }
        }
    })
}
exports.getSuggestions = getSuggestions;	