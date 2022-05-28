// priority: 0

console.info('Hello, World! (You will only see this line once in console, during startup)')


//
// REGISTRY
// New things are registered here. Here is where stuff is essentially "created"
onEvent('item.registry', event => {
	// Register new items here

	//Rubber
	event.create('rubber').displayName('Rubber')

	//Player Kill Reward
	event.create('kill_token').displayName('Heart Clump')
	event.create('kill_metal_ingot').displayName('Heart Steel')

	//Beer
	event.create('cereal').displayName('Cereal')
	event.create('steeped_malt').displayName('Steeped Malt')
	event.create('green_malt').displayName('Green Malt')
	event.create('dried_malt').displayName('Dried Malt')
	event.create('mashed_wort').displayName('Mashed Wort')
	event.create('drained_wort').displayName('Drained Wort')
	event.create('sparged_wort').displayName('Sparged Wort')
	event.create('spent_wort').displayName('Spent Wort')
	event.create('yeast').displayName('Yeast')
	event.create('beer_bottle').displayName('Bottle of Beer').food(food => {
		food.hunger(6)
		food.saturation(1.05)
		food.effect('minecraft:nausea', 12, 1, 1.0)
	})
	event.create('ipa_bottle').displayName('Bottle of Beer').food(food => {
		food.hunger(6)
		food.saturation(1.10)
		food.effect('minecraft:nausea', 12, 1, 1.0)
	})


	/// Co-op Items (Dark Souls Items)
	// TODO: Tooltips
	event.create('otherworld_shard').displayName('Otherworldly Shard')
	event.create('white_soapstone').displayName('White Sign Soapstone').maxDamage(100.0).unstackable().tooltip('Summons players from another world to assist you')
	event.create('cracked_redeye_orb').displayName('Cracked Red-Eye Orb')
	/*event.create('sunlight_medal', item => {
		item.displayName('Sunlight Medallion')
	})*/
	event.create('black_separation_crystal').displayName('Black Separation Crystal').tooltip('Use to go home from another world')
	event.create('homeward_bone').displayName('Homeward Bone').tooltip('Returns you to your bed in the overworld')
})

onEvent('block.registry', event => {
	// Register new blocks here

	//Waymark
	event.create('waymark_core').displayName('Waymark Core').hardness(10.0).noDrops().noItem()
	event.create('waymark_private_core').displayName('Waymark Core').hardness(10.0).noDrops().noItem()

	event.create('kill_metal_block').displayName('Heart Steel Block').hardness(5.0)


	//Created by white soapstone
	event.create('soapstone_mark').displayName('Summon Sign').defaultCutout().box(0, 0, 0, 16, 1, 16, true).noItem().noDrops().fullBlock(false)
})


onEvent('fluid.registry', event => {
	event.create('tree_sap').thinTexture(0x875d03).bucketColor(0x875d03).displayName('Tree Sap')
	event.create('sweet_wort').thinTexture(0x855605).bucketColor(0x855605).displayName('Sweet Wort')
	event.create('bitter_wort').thinTexture(0x7f8505).bucketColor(0x7f8505).displayName('Bitter Wort')
	event.create('hopped_wort').thinTexture(0x858105).bucketColor(0x858105).displayName('Hopped Wort')
	event.create('yeast_water').thinTexture(0xd9d79c).bucketColor(0xd9d79c).displayName('Activating Yeast')
	event.create('beer').thinTexture(0xe8cb0c).bucketColor(0xe8cb0c).displayName('Beer')
	event.create('ipa').thinTexture(0xe8dd0c).bucketColor(0xe8dd0c).displayName('IPA')
})

console.info('all things loaded successfully?')