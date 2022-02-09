// priority: 0

settings.logAddedRecipes = true
settings.logRemovedRecipes = true
settings.logSkippedRecipes = false
settings.logErroringRecipes = true



let summon_sign_pos



console.info('Hello, World! (You will see this line every time server resources reload)')
///
/// ITEM / BLOCK MANAGEMENT
///
onEvent('recipes', event => {
	// Change recipes here

	//Tree Sap
	event.recipes.create.mixing(Fluid.of('kubejs:tree_sap', 1000), [
		'minecraft:oak_sapling',
		'minecraft:oak_sapling',
		'minecraft:oak_sapling'
		])

	//Rubber
	event.recipes.create.compacting('kubejs:rubber', [
		Fluid.of('kubejs:tree_sap', 250)
		])

	//Rubber into belts
	event.shapeless('4x create:belt_connector', ['4x kubejs:rubber'])



	/// Co-op Items (Dark Souls)
	//TODO:
	//event.shapeasdfed()

})

onEvent('item.tags', event => {
	// Get the #forge:cobblestone tag collection and add Diamond Ore to it
	// event.get('forge:cobblestone').add('minecraft:diamond_ore')

	// Get the #forge:cobblestone tag collection and remove Mossy Cobblestone from it
	// event.get('forge:cobblestone').remove('minecraft:mossy_cobblestone')
})



/// ITEM / BLOCK INTERACTIONS
onEvent('item.right_click', event => {
	const world => event.getWorld()

	if(world.side !== "SERVER") {
		return
	}

	const item = event.getItem()

	if (item.id === 'minecraft:stick') {
		//waymark logic here
	}

	// Soapstone draw mark
	if (item.id === 'kubejs:white_soapstone') {
		let player = event.getPlayer()
		let lookingAt = player.rayTrace(player.reachDistance)
		if (lookingAt && lookingAt.block && lookingAt.facing == 'up') {
			let above = lookingAt.block.above
			above.set('kubejs:soapstone_mark')
		}

		//TODO: DAMAGE SOAPSTONE
	}
})


onEvent('block.right_click', event => {
	const world => event.getWorld()

	//WHITE SOAPSTONE
	if (event.block.id === 'kubejs:soapstone_mark') {
		let players = event.server.players
		for (var i = 0; i < Things.length; i++) {
			players.forEach(p => {
				p.tell(`${player.name} is summoning you to his world...`)
				p.tell('type !accept to join')
			})
		}
		summon_sign_pos = event.block.pos
	}

})



onEvent('player.chat', function (event) {
  

  //WHITE SOAPSTONE
  if (event.message.equals('!accept')) {
    event.player.tell('Being summoned to another world...')
    if (summon_sign_pos) {
    	    event.server.runCommandSilent(`/tp ${event.player} ${summon_sign_pos.x} ${summon_sign_pos.y} ${summon_sign_pos.z}`)
    } else {
    	event.player.tell('Not currently being summoned!')
    }
    event.cancel()
  }
})
