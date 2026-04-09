function map(doc) {
  var typesToExclude = [ 'data_record', 'task', 'contact', 'target', 'telemetry' ];
  if (doc.type && typesToExclude.indexOf(doc.type) === -1) {
    emit([ doc.type ]);
  }
}
