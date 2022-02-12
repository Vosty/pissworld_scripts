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
	const world = event.getWorld()

	if(world.side !== "SERVER") {
		return
	}

	const item = event.getItem()

	if (item.id === 'minecraft:stick') {
		//waymark logic here
		let player = event.getPlayer()
		let lookingAt = player.rayTrace(player.reachDistance)
		if (lookingAt && lookingAt.block && lookingAt.block == 'minecraft:gold_block') {
			console.info('GOLD')
			let below = lookingAt.block.down;
			let belowBelow = below.down;
			if (below && belowBelow && below == "minecraft:glass" && belowBelow == "minecraft:glass") {
				lookingAt.block.set('kubejs:waymark_core')
				player.tell('Waymark formed!')
			} 
		}
	}

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
	}

	// Homeward bone
	if (item.id === 'kubejs:homeward_bone') {
		let player = event.getPlayer()
		let spawnpoint = player.getSpawnLocation()
		let hand = event.hand
		event.server.runCommandSilent(`/tp ${player} ${spawnpoint.x} ${spawnpoint.y} ${spawnpoint.z}`)
		if (hand == MAIN_HAND) {
			player.getMainHandItem().count--
		} else {
			player.getOffHandItem().count--
		}

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
		console.info(`${invaded} is at ${invaded.x} ${invaded.y} ${invaded.z} in ${invadeWorld}.dimension`)
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
			for (let a = 0.0; a < PI * 2.0 + randomAngle; a = a+1.0) {
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
				invaded.tell([`Dark spirit `, Text.red(`${player}`), ` has invaded!`])
				player.tell(`Invaded world of ${invaded}`)
				console.info(`Teleporting ${player} to ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ} in ${invadeWorld.dimension}`)
				event.server.runCommandSilent(`/execute in ${invadeWorld.dimension} run tp ${player} ${goodPlaceX} ${goodPlaceY} ${goodPlaceZ}`)
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
	}

})


onEvent('block.right_click', event => {
	const world = event.getWorld()
	const player = event.player

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
	    event.server.scheduleInTicks(WHITE_SOAPSTONE_SUMMON_TIME_IN_TICKS, function(callback) {
	    	//event.player.paint({soapstone_summon: {remove: true}})
	    	callback.server.runCommandSilent(`/execute in ${summon_sign_dim} run tp ${event.player} ${summon_sign_pos.x} ${summon_sign_pos.y} ${summon_sign_pos.z}`)
	    })
    } else {
    	event.player.tell('Not currently being summoned!')
    }
    event.cancel()
  }
})
