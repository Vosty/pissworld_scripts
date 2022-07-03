//const COMMAND_PREFIX = '!'  //  Declared in main file

const WAYMARK_WARP_COMMAND = 'waywarp'
const WAYMARK_WARP_COMMAND_ALIAS = 'ww'
const WAYMARK_LIST_COMMAND = 'waylist'
const WAYMARK_RENAME_COMMAND = 'wayrename'
const WAYMARK_RENAME_SPLIT_DELIMITER = '=>'

const WAYMARK_PUBLIC_BLOCK_ID = 'minecraft:gold_block'
const WAYMARK_PRIVATE_BLOCK_ID = 'minecraft:iron_block'
const WAYMARK_BASE_BLOCK_ID = 'minecraft:glass'

const WAYMARK_ACTIVATOR_WAND_ID = 'kubejs:otherworld_shard'

const WAYMARK_MIN_PROXIMITY_DISTANCE = 15.0

const WAYMARK_SAFESPOT_SCAN_DISTANCE = 10.0


//const PI = 3.141592653 //  Declared in main file



let getWaymarkByName= function(event, name) {
	if (!event.server.persistentData || !event.server.persistentData.waymarks) {
		console.info('Uh oh! No waymark data found')
		return
	}
	waymarks = event.server.persistentData.waymarks
	let target = null
	waymarks.forEach(wm => {
		if (name === wm.markName) {
			target = wm
		}
	})

	if (!target) {
		console.info(`No waymark found with name: ${name}`)
	}
	return target
}

let getWayMarkByPos = function(event, dimension, x, y, z) {
	if (!event.server.persistentData || !event.server.persistentData.waymarks) {
		console.info('Uh oh! No waymark data found')
		return
	}
	console.info(`Looking for waymark in ${dimension} with coordinates ${x} ${y} ${z}`)
	waymarks = event.server.persistentData.waymarks
	let target = null
	waymarks.forEach(wm => {
		if (dimension.toString() === wm.dimension && x == wm.x && y== wm.y && z == wm.z) {
			target = wm
		}
	})
	if (!target) {
		console.info(`No waymark found with pos ${dimension} ${x} ${y} ${z}`)
	}
	return target
}

// Kind of obnoxious on purpose, to encourage players to rename their damn waymarks
// Let the shaming begin
let waymarkNameGenerator = function(markData) {
	let name = markData.owner.toString()
	switch (markData.dimension.toString()) {
		case 'minecraft:overworld':
			name+='OW'
			break
		case 'minecraft:the_nether':
			name+='NE'
			break
		case 'minecraft:the_end':
			name+='ED'
			break
		default:
			// Not a be-all end-all solution for mods with multiple dimensions
			// but these names are supposed to suck
			name+= markData.dimension.substring(0,2).toUpperCase()
	}
	name += Math.round(markData.x) + 'x'
	name += Math.round(markData.y) + 'y'
	name += Math.round(markData.z) + 'z'

	return name
}

// This function is probably mad ineffecient with a high number of waymarks but eh
// If its a real problem a wiser programmer than I will cache waymark locations
// so commonly used ones are first
let waymarkProximityCheck = function(event, player) {
	if (!event.server.persistentData || !event.server.persistentData.waymarks) {
		console.info('Uh oh! No waymark data found')
		return
	}
	waymarks = event.server.persistentData.waymarks
	let target = false
	waymarks.forEach(wm => {
		if (event.level.dimension.toString() === wm.dimension.toString()) {
			let dx = wm.x - player.x
			let dy = wm.y - player.y
			let dz = wm.z - player.z
			let dist = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2) + Math.pow(dz,2))
			if (dist <= WAYMARK_MIN_PROXIMITY_DISTANCE) {target = true}
		}
	})
	if (!target) {
	console.info(`No waymark found in range of ${player}`)
	}
	return target
}

// Checks the a spot as well above and below for a good 'landing zone'
// May need to add checks that this doesn't place into lava
let safetyCheck = function(world, posX, posY, posZ) {
	let block = world.getBlock(posX, posY, posZ)
		if (block && block === 'minecraft:air' && block.up === 'minecraft:air' && block.down !== 'minecraft:air') {
			result = {
				x : posX,
				y : posY,
				z : posZ,
			}
			return result
		}
		return false
}

// Search in a 'cyllinder minus double right cone' for a 'Safe Spot', aka two open airblocks on a surface
// This shape was chosen as avoids the goofy scenario of putting people directly on top of the waymark
// even when there are lots of more reasonable spots nearby
let getNearbySafeSpot = function(event, dimension, posX, posY, posZ) {
	//let world = event.server.getLevel(dimension) <= Currently bugged :)
	let allWorlds = event.server.allLevels
	let world
	allWorlds.forEach(wld => {
		if (dimension.toString() === wld.dimension.toString()) {
			world = wld
		}
	})
	if (!world) {
		console.info(`World ${dimension} not found!`)
		return null
	}
	//console.info('Not null!')
	let safeX, safeY, safeZ
	let randomAngle = Math.random() * PI * 2.0 //Random Angle to start scan

	// Scan in expanding circle around X and Z axii
	for (let dist = 1.0; dist <= WAYMARK_SAFESPOT_SCAN_DISTANCE; dist++) {
		//console.info('loop one')
		for (let angle = randomAngle; angle < PI * 2 + randomAngle; angle += 2 * PI / 32) { // May require more PI slices
			//console.info('loop two')
			// Scan slowly farther away for Y axis, starting from the center
			// A little messy but preferable to up / down scan
			for (let dy = 0.0; dy < dist + 1.0; dy++) { //The + 1 is a little magic to give the y axis most preferential treatment
				//console.info('loop three')
				safeX = Math.round(dist * Math.cos(angle) + posX)
				safeZ = Math.round(dist * Math.sin(angle) + posZ)

				safeY = posY + dy
				//console.info('DEEPER')
				let isSafeYPlus = safetyCheck(world, safeX, safeY, safeZ) // Result obj if safe, false if not safe
				if (isSafeYPlus) { return isSafeYPlus }
				safeY = posY - dy
				let isSafeYMinus = safetyCheck(world, safeX, safeY, safeZ)
				if (isSafeYMinus) { return isSafeYMinus }	
			}
		}
	}
	console.info('NULL')
	return null
}


/// WAYMARK CREATION
onEvent('item.right_click', event => {
	let world = event.getLevel()

	if(world.side !== "SERVER") {
		return
	}

	let item = event.getItem()

	if (item.id === WAYMARK_ACTIVATOR_WAND_ID) {
		//waymark logic here
		let player = event.getPlayer()
		let lookingAt = player.rayTrace(player.reachDistance)
		if (lookingAt && lookingAt.block && (lookingAt.block == WAYMARK_PUBLIC_BLOCK_ID || lookingAt.block == WAYMARK_PRIVATE_BLOCK_ID)) {
			let below = lookingAt.block.down;
			let belowBelow = below.down;
			if (below && belowBelow && below == WAYMARK_BASE_BLOCK_ID && belowBelow == WAYMARK_BASE_BLOCK_ID) {
				let publicWaymark = (lookingAt.block == WAYMARK_PUBLIC_BLOCK_ID)
				let setBlock = publicWaymark ? 'kubejs:waymark_core' : 'kubejs:waymark_private_core'
				lookingAt.block.set(setBlock)
				let playername = player.toString()

				let markData = NBT.compoundTag()
				markData.x = lookingAt.block.x
				markData.y = lookingAt.block.y
				markData.z = lookingAt.block.z
				markData.dimension = world.dimension.toString()
				markData.public = publicWaymark
				markData.owner = playername
				markData.markName = waymarkNameGenerator(markData)

				console.info(markData)

				if (!event.server.persistentData.waymarks) {
					event.server.persistentData.waymarks = NBT.listTag()
				}

				event.server.persistentData.waymarks.add(markData)

				console.info(event.server.persistentData.waymarks)

				player.tell(`Waymark ${markData.markName} formed! `)
				player.tell(`Use ${COMMAND_PREFIX}${WAYMARK_RENAME_COMMAND} <old name> ${WAYMARK_RENAME_SPLIT_DELIMITER} <new name> to rename this waymark`)
				if (publicWaymark) {
					player.tell(`This waymark is public, and will appear with command ${COMMAND_PREFIX}${WAYMARK_LIST_COMMAND}`)
					player.tell('Double check that you want players to see this waymark.')
				} else {
					player.tell(`This waymark is private, and will NOT appear with command ${COMMAND_PREFIX}${WAYMARK_LIST_COMMAND}`)
					player.tell('However, players who know the name (whether thru you telling them or finding and right clicking the core) may still warp here')
				}
			} 
		}
	}
})


onEvent('player.chat', function (event) {
    if (!event.message.startsWith(COMMAND_PREFIX) || event.level.side !== "SERVER") {
  		return
  	}

  	let message = event.message

  	if(message.startsWith(COMMAND_PREFIX + WAYMARK_WARP_COMMAND) || message.startsWith(COMMAND_PREFIX + WAYMARK_WARP_COMMAND_ALIAS)) {
  		let goal = message.substring(message.indexOf(' ') + 1)
  		if (goal && goal.length() > 0) {
  			let waymark = getWaymarkByName(event, goal)
  			if (waymark) {
  				if (waymarkProximityCheck(event, event.player)) {
  					let safeSpot = getNearbySafeSpot(event, waymark.dimension, waymark.x, waymark.y, waymark.z)
  					if (safeSpot) {
  						event.server.runCommandSilent(`/execute in ${waymark.dimension} run tp ${event.player} ${safeSpot.x} ${safeSpot.y} ${safeSpot.z}`)
  						console.info(`${event.player} teleported to waymark ${goal}`)
  					} else {
  						event.player.tell('The waymark appears to be blocked. Try again or clear a space for players to teleport')
  					}
  				} else {
  					event.player.tell('No waymark within range!')
  				}
  			} else {
  				event.player.tell(`No waymark found with the name: ${goal}`)
  			}
  		} else {
  			event.player.tell(`Improper Usage; please use ${COMMAND_PREFIX}${WAYMARK_WARP_COMMAND} <waymark name>`)
  		}
  		event.cancel()
  		return
  	}


  	if(message.startsWith(COMMAND_PREFIX + WAYMARK_LIST_COMMAND)) {
	  	if (!event.server.persistentData || !event.server.persistentData.waymarks) {
			console.info('Uh oh! No waymark data found')
			event.player.tell('No waymark data found')
			event.cancel()
			return
		}
		waymarks = event.server.persistentData.waymarks
		let wmList = Text.of('Waymarks: ')
		waymarks.forEach(wm => {
			if (wm.public) {
				wmList.append(Text.of(wm.markName).yellow())
				wmList.append('  ') //TODO: Get better formatting than this
			} else if (wm.owner.equals(event.player.toString())) {
				wmList.append(Text.of(wm.markName).gray().italic())
				wmList.append('  ')

			}
		})
		event.player.tell(wmList)
		event.cancel()
		return
  	}

  	// TODO: handle rename
  	if (message.startsWith(COMMAND_PREFIX + WAYMARK_RENAME_COMMAND)) {
		message = message.substring(message.indexOf(' ') + 1)
		let split = message.split(`${WAYMARK_RENAME_SPLIT_DELIMITER}`)
		if (split.length == 2 ) {
			let oldName = split[0].trim()
			let newName = split[1].trim()
			let wm = getWaymarkByName(event, oldName)
			if (wm == null) {
				event.player.tell(`No waymark found with name ${oldName}`)
				event.cancel()
				return
			}
			if (!wm.owner.toString().equals(event.player.toString())) {
				console.log(`Owner: ${wm.owner}    Attempter; ${event.player}`)
				event.player.tell('You can not rename waymarks you do not own!')
				event.cancel
				return
			}
			let existing = getWaymarkByName(event, newName) // Should return null
			if (existing) {
				event.player.tell(`A waymark with name ${newName} already exists!`)
				event.cancel()
				return
			}
			for (let i = 0; i < event.server.persistentData.waymarks.length; i++) {
				if (wm == event.server.persistentData.waymarks.get(i)) {
					// Delete old entry, add copy of entry into old position (keeps list consistent)
					event.server.persistentData.waymarks.remove(i)
					wm.markName = newName
					event.server.persistentData.waymarks.add(i, wm)
					break
				}
			}
			event.player.tell(`Waymark ${oldName} successfully renamed to ${newName}`)
		} else {
			event.player.tell(`Improper Usage; please use ${COMMAND_PREFIX}${WAYMARK_RENAME_COMMAND} <old name> ${WAYMARK_RENAME_SPLIT_DELIMITER} <new name>`)
		}
		event.cancel()
		return
  	}
})


onEvent('block.break', function (event) {
	let world = event.level

	if(world.side !== "SERVER") {
		return
	}
	if (event.block.id === 'kubejs:waymark_core' || event.block.id === 'kubejs:waymark_private_core') {
		let block = event.block

		for (let i = 0; i < event.server.persistentData.waymarks.length; i++) {
			let wm = event.server.persistentData.waymarks.get(i)
			if (world.dimension.toString() === wm.dimension && block.x == wm.x && block.y == wm.y && block.z == wm.z) {
				event.server.persistentData.waymarks.remove(i)
				event.player.tell(`Waymark ${wm.markName} removed`)
				return
			}
		}
		console.info(`No waymark found with position ${world.dimension.toString()} ${block.x} ${block.y} ${block.z}`)
		event.player.tell('Destroyed a waymark core with no registered position.')
		event.player.tell('....What did you do?')
	}
})

onEvent('block.right_click', event => {
	let world = event.level
	let player = event.player

	if(world.side !== "SERVER") {
		return
	}

	let block = event.block
	if (event.hand == MAIN_HAND && (block.id === 'kubejs:waymark_core' || block.id ==='kubejs:waymark_private_core')) {
		let waymark = getWayMarkByPos(event, world.dimension, block.x, block.y, block.z)
		if (waymark) { player.tell(`Waymark Name: ${waymark.markName}    Owner: ${waymark.owner}`) }
		player.tell(`Use ${COMMAND_PREFIX}${WAYMARK_WARP_COMMAND} <waymark name> or ${COMMAND_PREFIX}${WAYMARK_WARP_COMMAND_ALIAS} <waymark name> to warp`)
		event.cancel()
	}
})