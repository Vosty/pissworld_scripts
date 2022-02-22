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
	// TODO: Tooltips
	event.create('otherworld_shard', item => {
		item.displayName('Otherworldly Shard')
	})
	event.create('white_soapstone', item => {
		item.displayName('White Sign Soapstone')
		item.maxDamage(100.0)
		item.unstackable()
		item.tooltip('Summons players from another world to assist you')

	})
	event.create('cracked_redeye_orb', item=> {
		item.displayName('Cracked Red-Eye Orb')
	})
	/*event.create('sunlight_medal', item => {
		item.displayName('Sunlight Medallion')
	})*/
	event.create('black_separation_crystal', item => {
		item.displayName('Black Separation Crystal')
		item.tooltip('Use to go home from another world')
	})
	event.create('homeward_bone', item => {
		item.displayName('Homeward Bone')
		item.tooltip('Returns you to your bed')
	})

})

onEvent('block.registry', event => {
	// Register new blocks here

	//Waymark
	event.create('waymark_core', block => {
		block.displayName('Waymark Core')
		block.hardness(10.0)
		block.noDrops()
		block.noItem()
	})
	event.create('waymark_private_core', block => {
		block.displayName('Waymark Core')
		block.hardness(10.0)
		block.noDrops()
		block.noItem()

	})


	//Created by white soapstone
	event.create('soapstone_mark', block => {
		block.displayName('Summon Sign')
		block.defaultCutout()
		block.box(0, 0, 0, 16, 1, 16, true)
		block.noItem()
		block.noDrops()
		block.fullBlock(false)
	})
})


onEvent('fluid.registry', event => {
	event.create('tree_sap', fluid => {
		fluid.textureThin(0x875d03)
		fluid.bucketColor(0x875d03)
		fluid.displayName('Tree Sap')
	})
})

console.info('all things loaded successfully?')