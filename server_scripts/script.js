// priority: 0

settings.logAddedRecipes = true
settings.logRemovedRecipes = true
settings.logSkippedRecipes = false
settings.logErroringRecipes = true

//CONFIGS
const TEST_MODE = true //Allows players to do things like invade themselves

const COMMAND_PREFIX = '!'

const WHITE_SOAPSTONE_COMMAND = 'join'
const WHITE_SOAPSTONE_SUMMON_TIME_IN_TICKS = 60
const WHITE_SOAPSTONE_TIMEOUT_TIME_IN_TICKS = 300

const REDEYE_INVASION_TIME_IN_TICKS = 160
const REDEYE_INVASION_DISTANCE_FROM_PLAYER = 45
const REDEYE_INVSASION_MIN_DISTANCE_FROM_PLAYER = 16

const BLACK_SEPARATION_CRYSTAL_TIME_IN_TICKS = 200

let summon_sign_pos = null
let summon_sign_dim = null
let summoner = null


let PI = 3.141592653


let getOtherPlayers = function(event) {
	let player = event.player
	let allPlayers = event.server.players
	let otherPlayers = allPlayers.filter(function(value) {
			return value.name == player.name || TEST_MODE
		})
	return otherPlayers
}


let alloy = function(event, inputs, resultFluid, amount, temperature ) {
	event.custom({
		"type": "tconstruct:alloy",
		"inputs": inputs, // [{ 'name':'XXXXX', 'amount': 0000 },...]
		"result": {
			"fluid": resultFluid,
			"amount": amount
		},
		"temperature": temperature
	})
}



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
	event.shapeless('1x kubejs:white_soapstone', ['1x minecraft:bone_meal', '1x kubejs:otherworld_shard'])
	event.shapeless('1x kubejs:homeward_bone', ['1x minecraft:bone', '1x kubejs:otherworld_shard'])
	event.shaped('1x kubejs:cracked_redeye_orb', [
		'SSS',
		'SAS',
		'SSS'
		], {
			S: 'kubejs:otherworld_shard',
			A: 'minecraft:ender_pearl'
		})

	/// Beer

	event.recipes.create.milling('kubejs:cereal', ['minecraft:wheat'])
	event.recipes.create.mixing('kubejs:steeped_malt', [
		'kubejs:cereal',
		Fluid.of('minecraft:water', 250)
	])
	event.recipes.create.splashing('kubejs:green_malt', ['kubejs:steeped_malt'])
	event.smelting('1x kubejs:dried_malt', '1x kubejs:green_malt')
	event.recipes.create.mixing('kubejs:mashed_wort', [
		Item.of('kubejs:dried_malt', 3),
		Fluid.of('minecraft:water', 1000)
	]).processingTime(200).heated()
	event.recipes.create.emptying([Fluid.of('kubejs:sweet_wort', 750), 'kubejs:drained_wort'], 'kubejs:mashed_wort')
	event.recipes.create.filling('kubejs:sparged_wort', ['kubejs:drained_wort', Fluid.of('minecraft:water', 500)])
	event.recipes.create.emptying([Fluid.of('kubejs:sweet_wort', 250), 'kubejs:spent_wort'], 'kubejs:sparged_wort')
	event.recipes.create.mixing(Fluid.of('kubejs:hopped_wort',1000), [
		Item.of('minecraft:sugar', 3),
		Fluid.of('kubejs:sweet_wort', 1000)
	]).processingTime(100).heated()
	event.recipes.create.mixing(Fluid.of('kubejs:hopped_wort', 1000), [
		Item.of('minecraft:sugar', 3),
		Fluid.of('kubejs:sweet_wort', 1000),
	]).processingTime(100).heated()
	event.recipes.create.mixing(Fluid.of('kubejs:yeast_water', 500), [
		Fluid.of('kubejs:yeast_water', 250),
		Fluid.of('minecraft:water', 250)
	]).processingTime(100).heated()
	event.recipes.create.mixing(Fluid.of('kubejs:yeast_water', 250), [
		Item.of('kubejs:yeast', 1),
		Fluid.of('minecraft:water', 250)
	]).processingTime(50).heated()
	alloy(event, [
		{ 'name': 'kubejs:yeast_water', 'amount': 100},
		{ 'name': 'kubejs:hopped_wort', 'amount': 1000}], 'kubejs:beer', 1000, 1000)
	event.recipes.create.filling('kubejs:beer_bottle', ['minecraft:glass_bottle', Fluid.of('kubejs:beer', 333)])

})

onEvent('item.tags', event => {
	// Get the #forge:cobblestone tag collection and add Diamond Ore to it
	// event.get('forge:cobblestone').add('minecraft:diamond_ore')

	// Get the #forge:cobblestone tag collection and remove Mossy Cobblestone from it
	// event.get('forge:cobblestone').remove('minecraft:mossy_cobblestone')
})



/// ITEM / BLOCK INTERACTIONS
onEvent('item.right_click', event => {
	let world = event.getWorld()

	if(world.side !== "SERVER") {
		return
	}

	let item = event.getItem()

	// Soapstone draw mark
	if (item.id === 'kubejs:white_soapstone' /*&& event.hand == MAIN_HAND*/) {
		let player = event.getPlayer()
		let lookingAt = player.rayTrace(player.reachDistance)
		if (lookingAt && lookingAt.block && lookingAt.facing == 'up') {
			//console.info(lookingAt.block)
			let above = lookingAt.block.up
			//console.info(above)
			above.set('kubejs:soapstone_mark')
			player.damageHeldItem(event.hand, 10)
			console.info(`soapstone mark placed by ${player}`)
		}
		return
	}

	// Homeward bone
	if (item.id === 'kubejs:homeward_bone') {
		let player = event.getPlayer()
		let spawnpoint = player.getSpawnLocation()
		let hand = event.hand
		event.server.runCommandSilent(`/execute in ${spawnpoint.dimension} run tp ${player} ${spawnpoint.x} ${spawnpoint.y} ${spawnpoint.z}`)
		if (hand == MAIN_HAND) {
			player.getMainHandItem().count--
		} else {
			player.getOffHandItem().count--
		}
		return
	}

	// Cracked Redeye Orb
	if (item === 'kubejs:cracked_redeye_orb') {
		let player = event.player
		let allPlayers = event.server.players
		let worldsToInvade = getOtherPlayers(event)
		if (worldsToInvade.length == 0) {
			player.tell('No worlds to invade')
			return
		}
		let rand = Math.round(Math.random() * (worldsToInvade.length-1))
		console.info(rand)
		let invaded = worldsToInvade[rand]
		let invadeWorld = invaded.world
		console.info(`${invaded} is being invaded!`)
		console.info(`${invaded} is at ${invaded.x} ${invaded.y} ${invaded.z} in ${invadeWorld.dimension}`)
		player.tell('Searching for worlds to invade...')

		//find proper spot to invade player
		//pick random angle, then arc around player searching for open spots
		//if no spot is found, move in slightly until minimum distance is reached
		let randomAngle = Math.random() * PI * 2.0
		//console.info(randomAngle)
		let goodPlaceX
		let goodPlaceY = invaded.y
		let goodPlaceZ
		let placeFound = false
		for (let dist = REDEYE_INVASION_DISTANCE_FROM_PLAYER; dist >= REDEYE_INVSASION_MIN_DISTANCE_FROM_PLAYER; dist--) {
			//console.info(`checking distance: ${dist}`)
			for (let a = 0.0; a < PI * 2.0; a += PI * 2 / 32) {
				//console.long(checking angle)
				goodPlaceX = dist * Math.cos(a + randomAngle) + invaded.x
				goodPlaceZ = dist * Math.sin(a + randomAngle) + invaded.z

				let block = invadeWorld.getBlock(goodPlaceX, goodPlaceY, goodPlaceZ)
				//Health check: two spaces of open air on solid ground
				if (block === 'minecraft:air' && block.up === 'minecraft:air' && block.down !== 'minecraft:air') {
					placeFound = true
					break
				}
			}
			if (placeFound) {
				console.info(`Distance to player: ${dist}`)
				break
			}
		}

		//send the player
		if (placeFound) {
			event.server.scheduleInTicks(REDEYE_INVASION_TIME_IN_TICKS, function(callback) {
				let separation_crystal_pos = NBT.compoundTag()
				separation_crystal_pos.x = player.x
				separation_crystal_pos.y = player.y
				separation_crystal_pos.z = player.z
				separation_crystal_dim = player.world.dimension
				player.persistentData.separation_pos = separation_crystal_pos

				console.info(`Teleporting ${player} to ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ} in ${invadeWorld.dimension}`)
				event.server.runCommandSilent(`/execute in ${invadeWorld.dimension} run tp ${player} ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ}`)
				event.server.runCommandSilent(`/give ${player} kubejs:black_separation_crystal`)
				event.server.runCommandSilent(`/playsound minecraft:block.portal.travel block ${player} ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ} 0.5`)
				event.server.runCommandSilent(`/playsound minecraft:block.portal.travel block ${invaded} ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ} 1.0`)
				invaded.tell([`Dark spirit `, Text.red(`${player}`), ` has invaded!`])
				player.tell(`Invaded world of ${invaded}`)

			})
		} else {
			console.info('invasion failed')
			player.tell('Failed to find fair location near player')
		}

		let hand = event.hand
		if (hand == MAIN_HAND) {
			player.getMainHandItem().count--
		} else {
			player.getOffHandItem().count--
		}
		return
	}

	// Black Separation Crystal
	if (item == 'kubejs:black_separation_crystal') {
		let player = event.player
		let data = null
		let hand = event.hand
		if (player.persistentData && player.persistentData.separation_pos) {
			player.tell('Returning you to your world...')
			data = player.persistentData.separation_pos
		} else {
			player.tell('Return point not found! Sending to spawn point...')
			data = player.getSpawnLocation()
		}
		if (hand == MAIN_HAND) {
			player.getMainHandItem().count--
		} else {
			player.getOffHandItem().count--
		}
		event.server.scheduleInTicks(BLACK_SEPARATION_CRYSTAL_TIME_IN_TICKS, function(callback) {
			callback.server.runCommandSilent(`/execute in ${data.dimension} run tp ${player} ${data.x} ${data.y} ${data.z}`)

		})
		return
	}

})


onEvent('block.right_click', event => {
	let world = event.getWorld()
	let player = event.player

	if(world.side !== "SERVER") {
		return
	}

	//WHITE SOAPSTONE
	if (event.hand == MAIN_HAND && event.block.id === 'kubejs:soapstone_mark') {
		if (summon_sign_pos) {
			player.tell('Someone is already summoning!')
			return
		}
		console.info(`soapstone mark clicked by ${event.player}`)
		player.tell('Summoning white phantoms to your world')
		let players = getOtherPlayers(event)
		players.forEach(p => {
			p.tell(`${p.name} is summoning you to his world...`)
			p.tell(`type ${COMMAND_PREFIX}${WHITE_SOAPSTONE_COMMAND} to be summoned`)
		})
		summon_sign_pos = event.block.pos
		summon_sign_dim = event.block.dimension
		summoner = player.name
		event.server.scheduleInTicks(WHITE_SOAPSTONE_TIMEOUT_TIME_IN_TICKS, function(callback) {
			summon_sign_pos = null
			summon_sign_dim = null
			summoner = null
		})
		return
	}

})



onEvent('player.chat', function (event) {
  if (event.message.startsWith(COMMAND_PREFIX) == false) {
  	return
  }

  if(event.world.side !== "SERVER") {
	return
  }

  let message = event.message
  console.info(`player command: ${message}`)

  //WHITE SOAPSTONE
  if (message.equals(COMMAND_PREFIX + WHITE_SOAPSTONE_COMMAND)) {
  	if (event.player.name.equals(summoner) && !TEST_MODE) {
  		event.player.tell('You can not be summoned to your own world!')
  		event.cancel()
  		return
  	}
    if (summon_sign_pos) {
	    event.player.tell('Being summoned to another world...')
	    //event.player.paint({soapstone_summon: {type: 'rectangle', texture: 'kubejs:screen/white_particles.png', x:0, y:0, w:'$screenW', h:'$screenH'}})
	    console.info(`${event.player} has been summoned to world of ${summoner}`)

	    let separation_crystal_pos = NBT.compoundTag()
		separation_crystal_pos.x = event.player.x
		separation_crystal_pos.y = event.player.y
		separation_crystal_pos.z = event.player.z
		separation_crystal_dim = event.player.world.dimension
		event.player.persistentData.separation_pos = separation_crystal_pos

	    event.server.scheduleInTicks(WHITE_SOAPSTONE_SUMMON_TIME_IN_TICKS, function(callback) {
	    	//event.player.paint({soapstone_summon: {remove: true}})
	    	if (summon_sign_pos && summon_sign_dim && summoner) {
	    		callback.server.runCommandSilent(`/execute in ${summon_sign_dim} run tp ${event.player} ${summon_sign_pos.x} ${summon_sign_pos.y} ${summon_sign_pos.z}`)
	    		callback.server.runCommandSilent(`/give ${event.player} kubejs:black_separation_crystal`)
	    		//callback.server.runCommandSilent(`/playsound minecraft:block.portal.travel block @a[distance=...20.0] ${summon_sign_pos.x} ${summon_sign_pos.y} ${summon_sign_pos.z} 0.5`)
	    	} else {
	    		event.player.tell('Summon timed out')
	    	}
	    	
	    })
    } else {
    	event.player.tell('Not currently being summoned!')
    }
    event.cancel()
    return
  }
})
