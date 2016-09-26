// var elasticsearch = require('elasticsearch');
//
// var elasticClient = new elasticsearch.Client({
//   host: 'localhost:9200',
//   log: 'info'
// });
//
//
// elasticClient.ping({
//   requestTimeout: 30000,
//
//   // undocumented params are appended to the query string
//   hello: "elasticsearch"
// }, function(error) {
//   if (error) {
//     console.error('elasticsearch cluster is down!');
//   } else {
//     console.log('All is well');
//   }
// });
//
// var indexName = "chibleeRandomIndex";
//
// /**
//  * Delete an existing index
//  */
// function deleteIndex() {
//   return elasticClient.indices.delete({
//     index: indexName
//   });
// }
// exports.deleteIndex = deleteIndex;
//
// /**
//  * create the index
//  */
// function initIndex() {
//   return elasticClient.indices.create({
//     index: indexName
//   });
// }
// exports.initIndex = initIndex;
//
// /**
//  * check if the index exists
//  */
// function indexExists() {
//   return elasticClient.indices.exists({
//     index: indexName
//   });
// }
// exports.indexExists = indexExists;
//
// function initMapping() {
//   return elasticClient.indices.putMapping({
//     index: indexName,
//     type: "document",
//     body: {
//       properties: {
//         name: {
//           type: "string"
//         },
//         category: {
//           type: "string"
//         },
//         subCategory: {
//           type: "string"
//         },
//         address: {
//           type: "string"
//         },
//         area: {
//           type: "string"
//         },
//         tags: {
//           type: [String]
//         },
//         coords: {
//           type: [Number],
//           index: '2dsphere'
//         },
//         suggest: {
//           type: "completion",
//           analyzer: "simple",
//           search_analyzer: "simple",
//           payloads: true
//         }
//       }
//     }
//   });
// }
// exports.initMapping = initMapping;
//
// function addDocument(document) {
//   console.log('addDocument');
//   return elasticClient.index({
//     index: indexName,
//     type: "document",
//     body: {
//       name: document.name,
//       category: document.category,
//       subCategory: document.subCategory,
//       address: document.address,
//       area: document.area,
//       tags: document.tags,
//       coords: document.coords,
//       suggest: {
//         input: document.name,
//         output: document.name,
//         payload: document.metadata || {}
//       }
//     }
//   });
// }
// exports.addDocument = addDocument;
//
// function getSuggestions(input) {
//   return elasticClient.suggest({
//     index: indexName,
//     type: "document",
//     body: {
//       docsuggest: {
//         text: input,
//         completion: {
//           field: "suggest",
//           fuzzy: true
//         }
//       }
//     }
//   })
// }
// exports.getSuggestions = getSuggestions;
