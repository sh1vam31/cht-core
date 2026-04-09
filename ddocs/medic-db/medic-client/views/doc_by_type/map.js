function map(doc) {
  const typesToExclude = [ 'data_record', 'task', 'contact', 'target', 'telemetry' ];
  if (doc.type && !typesToExclude.includes(doc.type)) {
    emit([ doc.type ]);
  }
}
