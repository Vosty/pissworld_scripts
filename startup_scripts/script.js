// priority: 0

console.info('Hello, World! (You will only see this line once in console, during startup)')

onEvent('item.registry', event => {
	// Register new items here
	// event.create('example_item').displayName('Example Item')
	event.create('rubber', item => {
		item.displayName('Rubber')
	})
})

onEvent('block.registry', event => {
	// Register new blocks here
	// event.create('example_block').material('wood').hardness(1.0).displayName('Example Block')
})


onEvent('fluid.registry', event => {
	event.create('tree_sap', fluid => {
		fluid.textureThin(0x875d03)
		fluid.bucketColor(0x875d03)
		fluid.displayName('Tree Sap')
	})
})