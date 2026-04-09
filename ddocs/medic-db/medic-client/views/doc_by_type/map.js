function map(doc) {
  var typesToExclude = { 'data_record': 1, 'task': 1, 'target': 1, 'telemetry': 1 };
  if (doc.type && !typesToExclude[doc.type]) {
    emit([ doc.type ]);
  }
}
