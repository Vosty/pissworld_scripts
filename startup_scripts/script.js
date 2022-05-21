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

	//Beer
	event.create('cereal', item => {
		item.displayName('Cereal')
	})
	event.create('steeped_malt', item => {
		item.displayName('Steeped Malt')
	})
	event.create('green_malt', item => {
		item.displayName('Greet Malt')
	})
	event.create('dried_malt', item => {
		item.displayName('Dried Malt')
	})
	event.create('mashed_wort', item => {
		item.displayName('Mashed Wort')
	})
	event.create('drained_wort', item => {
		item.displayName('Drained Wort')
	})
	event.create('sparged_wort', item => {
		item.displayName('Sparged Wort')
	})
	event.create('spent_wort', item => {
		item.displayName('Spent Wort')
	})
	event.create('yeast', item => {
		item.displayName('Yeast')
	})
	event.create('beer_bottle', item => {
		item.displayName('Bottle of Beer')
		item.food(food => {
			food.hunger(6)
			food.saturation(1.05)
			food.effect('minecraft:nausea', 12, 1, 1.0)
		})
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
	event.create('sweet_wort', fluid => {
		fluid.textureThin(0x855605)
		fluid.bucketColor(0x855605)
		fluid.displayName('Sweet Wort')
	})
	event.create('hopped_wort', fluid => {
		fluid.textureThin(0x858105)
		fluid.bucketColor(0x858105)
		fluid.displayName('Hopped Wort')
	})
	event.create('yeast_water', fluid => {
		fluid.textureThin(0xd9d79c)
		fluid.bucketColor(0xd9d79c)
		fluid.displayName('Activating Yeast')
	})
	event.create('beer', fluid => {
		fluid.textureThin(0xe8cb0c)
		fluid.bucketColor(0xe8cb0c)
		fluid.displayName('Beer')
	})
})

console.info('all things loaded successfully?')