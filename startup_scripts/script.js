// priority: 0

console.info('Hello, World! (You will only see this line once in console, during startup)')


//
// REGISTRY
// New things are registered here. Here is where stuff is essentially "created"
onEvent('item.registry', event => {
	// Register new items here

	//Rubber
	event.create('rubber', item => {
		item.displayName('Rubber')
	})

	/// Co-op Items (Dark Souls Items)
	event.create('otherworld_shard', item => {
		item.displayName('Otherwordly Shard')
	})
	event.create('white_soapstone', item => {
		item.displayName('White Sign Soapstone')
	})
	event.create('cracked_redeye_orb', item=> {
		item.displayName('Cracked Red-Eye Orb')
	})
	event.create('sunlight_medal', item => {
		item.displayName('Sunlight Medallion')
	})
	event.create('black_separation_crystal', item => {
		item.displayName('Black Separation Crystal')
	})
	even.create('homeward_bone', item => {
		item.displayName('Homeward Bone')
	})

})

onEvent('block.registry', event => {
	// Register new blocks here

	//Waymark
	event.create('waymark_core', block => {
		block.displayName('Waymark Core')
	})
})


onEvent('fluid.registry', event => {
	event.create('tree_sap', fluid => {
		fluid.textureThin(0x875d03)
		fluid.bucketColor(0x875d03)
		fluid.displayName('Tree Sap')
	})
})