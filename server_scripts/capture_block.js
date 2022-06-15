const STEAL_BLOCK_ID = 'kubejs:steal_block'
const RECEPTICLE_BLOCK_ID = 'kubejs:recepticle'
const COMPASS_ITEM_ID = 'kubejs:finders_compass'

const LEADERBOARD_COMMAND = 'leaderboard'

const UNKNOWN_PLAYER_NAME = '?????'

const BUFF_APPLY_RATE_MINS = 10


/*Legend
Ide = raw combat buffs
Voltes = breaking blocks
Rayearth = healing
O = Sneaking, evil stuff
Raideen = Foot Stuff
Ginrei = Misc utility
Dunbine = water




*/


const POTIONS_BUFFS = [
{ name:'minecraft:strength', amp:4 , tip:'By the power of Ide, you hit harder and do more damage'},
{ name:'minecraft:fire_resistance', amp:10, tip:'By the power of Ide, you resist damage to fire' },
{ name:'minecraft:glowing', amp:0, tip: 'By the power of Ginrei, you may see friends and foes through walls'},
{ name:'minecraft:haste', amp:4, tip: 'By the power of Voltes, you break blocks faster' },
{ name:'minecraft:health_boost', amp:4, tip: 'By the power of Rayearth, you have extra health' },
{ name:'minecraft:hero_of_the_village', amp:3, tip: 'By the power of Ginrei, you get reduced prices from villagers' },
{ name:'minecraft:jump_boost', amp:2, tip: 'By the power of Raideen, you jump higher' },
{ name:'minecraft:conduit_power', amp:19, tip: 'By the power of Dunbine, you breathe better and break blocks faster under water'},
{ name:'minecraft:dolphins_grace', amp:255, tip: 'By the power of Dunbine, you swim faster'},
{ name:'minecraft:night_vision', amp:0, tip: 'By the power of Ginrei, you may see in complete darkness'},
{ name:'minecraft:regeneration', amp:0, tip: 'By the power of Rayearth, you have a small regeneration effect'},
{ name:'alexsmobs:soul_steal', amp:0, tip: 'By the power of O, you steal health from others'},
{ name:'alexsmobs:clinging', amp:0, tip: 'By the power of Raideen, you cling to ceilings'},
{ name:'alexsmobs:knockback_resistance', amp:1, tip: 'By the power of Ide, you resist knockback'},
{ name:'alexsmobs:poison_resistance', amp:0, tip: 'By the power of Rayearth, you have immunity to poison'},
{ name:'alexsmobs:fleet_footed', amp:0, tip: 'By the power of Raideen, you have increased sprinting and jumping speed'},
{ name:'alexsmobs:orcas_might', amp:0, tip: 'By the power of Ide, you attack faster'},
{ name:'alexsmobs:lava_vision', amp:0, tip: 'By the power of Ginrei, you may see in lava'},
{ name:'ars_nouveau:mana_regen', amp:4, tip: 'By the power of Rayearth, you regenerate mana faster'},
{ name:'ars_nouveau:glide', amp:0, tip: 'By the power of Raideen, you glide, as if you were wearing wings'},
{ name:'ars_nouveau:bounce', amp:0, tip: 'By the power of Raideen, you bounce upon landing'},
{ name:'ars_nouveau:spell_damage', amp:2, tip: 'By the power of Ide, you do additional damage on your (Ars) spells'},
{ name:'botania:soul_cross', amp:0, tip: 'By the power of O, you steal health from those you kill'},
{ name:'botania:feather_feet', amp:0, tip: 'By the power of Raideen, you have immunity to fall damage'},
{ name:'botania:allure', amp:0, tip: 'By the power of Dunbine, you catch fish faster'},
{ name:'farmersdelight:nourishment', amp:0, tip: 'By the power of Rayearth, you resist hunger'},
{ name:'farmersdelight:comfort', amp:0, tip: 'By the power of Rayearth, your natural healing abilities are increased'},
{ name:'tombstone:diversion', amp:0, tip: 'By the power of O, mobs will ignore your presence'},
{ name:'tombstone:purification', amp:0, tip: 'By the power of Rayearth, you will naturally cleanse negative effects'},
{ name:'tombstone:reach', amp:0, tip: 'By the power of Ginrei, you reach further'},
{ name:'tombstone:frost_resistance', amp:0, tip: 'By the power of Ide, you gain resistance to frost damage and freezing'},
{ name:'tombstone:bone_shield', amp:0, tip: 'By the power of Ide, you reflect some damage onto melee attackers'},
{ name:'tombstone:true_sight', amp:0, tip: 'By the power of Ginrei, you see clearly in all environments, and can see those who are invisible'},
{ name:'tconstruct:momentum', amp:0, tip: 'By the power of Voltes, you gain block breaking speed, increasing as you break more blocks'},
{ name:'tconstruct:insatiable', amp:0, tip: 'By the power of Ide, you gain attack damage, increasing as you attack more mobs'},
{ name:'tconstruct:calcified', amp:0, tip: 'By the power of Ginrei, you gain magical bones, which gain additional powers by drinking milk'},
{ name:'tconstruct:magnetic', amp:0, tip: 'By the power of Ginrei, Items from block and entities will instantly enter your inventory'}
]



function createPlayerLeaderBoardStats(player) {
	let data = NBT.compoundTag()
	data.name = player /// The name of the player
	data.captures = 0  /// The number of times they have broken the SUPER CUBE (includes at the spawn)
	data.public_captures = 0 /// The number of times they have stolen the SUPER CUBE from spawn
	data.returns = 0 /// The number of times they have returned the SUPER CUBE to spawn
	data.buffs_received = 0 /// The number of buffs each player has received (does not include buffs for everyone) (scales with # of players)
	data.minutes_held = 0 /// The number of minutes the player has 'defended' the SUPER CUBE (includes when that player is offline) (does not scale)
	return data
}

function getPlayerLeaderBoardStats(player, server) {
	if (!server.persistentData.capture_leaderboard) {
		console.info('Creating bounty leaderboard data')
		server.persistentData.capture_leaderboard = NBT.listTag()
	}
	let target = null
		server.persistentData.capture_leaderboard.forEach(entry => {
		if (player === entry.name) {
			target = entry
			console.info(`Found Leaderboard Stats for ${player}`)
		}
	})
	if (!target) {
		console.info(`Creating leaderboard data for ${player}`)
		target = createPlayerLeaderBoardStats(player)
		server.persistentData.capture_leaderboard.add(target)
	}
	return target
}


function updateLeaderBoardStats(player, server, data) {
	if (player == UNKNOWN_PLAYER_NAME) {
		return
	}
	let i
	for (i = 0; i < server.persistentData.capture_leaderboard.length; i++) {
		if (server.persistentData.capture_leaderboard.get(i).name == player) {
			console.info(`Updating leaderboard data for ${player}: ${data}`)
			server.persistentData.capture_leaderboard.remove(i)
			server.persistentData.capture_leaderboard.add(i, data)
		}
	}
}

function isPlayerOnline(player, server) {
	let allPlayers = server.players
	let target = false
	allPlayers.forEach(p => {
		if (player.equals(p.toString())) {
			target = p
		}
	})
	return target
}

function getOtherOnlinePlayers(player, server) {
	let allPlayers = server.players
	let otherPlayers = allPlayers.filter(function(value) {
		return value.toString() != player || TEST_MODE // A constant from server_scripts
	})
	return otherPlayers
}

function applyPotionBuff(player, server) {
	let rand = Math.round(Math.random() * (POTIONS_BUFFS.length-1))
	let buff = POTIONS_BUFFS[rand]
	let seconds = BUFF_APPLY_RATE_MINS * 60
	console.info(`Giving ${player} buff ${buff.name} for ${seconds} seconds`)
	server.runCommandSilent(`/effect give ${player} ${buff.name} ${seconds} ${buff.amp}`)
	player.tell(buff.tip)
}




onEvent('block.place', event => {
	let world = event.level

	if (world.side !== "SERVER") {
		return
	}

	if (event.block.id === STEAL_BLOCK_ID) {
		let player = event.entity
		if (!player.isPlayer()){
			event.server.tell('UHHHHH DONT DO THAT, WHATEVER YOU JUST DID')
			return
		}
		event.server.persistentData.steal_block_owner = player.toString()
		event.server.persistentData.steal_block_placed = true
		let steal_block_location = NBT.compoundTag()
		steal_block_location.x = event.block.x
		steal_block_location.y = event.block.y
		steal_block_location.z = event.block.z
		steal_block_location.dimension = world.dimension
		event.server.persistentData.steal_block_location = steal_block_location

		if (event.block.down && event.block.down == RECEPTICLE_BLOCK_ID) {
			event.server.tell(`${player} has returned the Soul of Blessings to its rightful place at the spawn!`)
			event.server.persistentData.steal_block_shared = true
			let data = getPlayerLeaderBoardStats(player.toString(), event.server)
			data.returns += 1
			updateLeaderBoardStats(player.toString(), event.server, data)
		} else {
			event.server.tell(`${player} has hidden the Soul of Blessings for their own personal gain!`)
			event.server.persistentData.steal_block_shared = false
		}
	}
})



onEvent('block.break', function (event) {
	let world = event.level

	if (world.side !== "SERVER") {
		return
	}

	if (event.block.id === STEAL_BLOCK_ID) {
		let player = event.player
		if (!player) {
			event.server.tell('The Soul of Blessings was broken, but not by a player?')
			event.server.persistentData.steal_block_placed = false
			event.server.persistentData.steal_block_shared = false
			event.server.persistentData.steal_block_owner = UNKNOWN_PLAYER_NAME
			return
		}

		if ((event.server.persistentData.steal_block_owner && player.toString().equals(event.server.persistentData.steal_block_owner)) && !TEST_MODE) {
			//To keep things simple in regards to preventing leaderboard abuse, you can't break your own SUPER CUBE
			//Place it correctly the right time lol
			event.player.tell(`You can't break your own placed Soul of Blessings`)
			event.player.tell('Too bad? Cry about it...')
			event.cancel()
			return
		}

		let playerData = getPlayerLeaderBoardStats(player.toString(), event.server)

		if (event.server.persistentData.steal_block_shared) { //Exists and is true
			event.server.tell(`${player} has stolen the Soul of Blessings from the spawn!`)
			playerData.public_captures++
			playerData.captures++
		} else {
			event.server.tell(`${player} has found and broken ${event.server.persistentData.steal_block_owner}'s placed Soul of Blessings!`)
			playerData.captures++
		}

		event.server.persistentData.steal_block_placed = false
		event.server.persistentData.steal_block_shared = false
		event.server.persistentData.steal_block_owner = player.toString()
		updateLeaderBoardStats(player.toString(), event.server, playerData)
	}
})


onEvent('item.right_click', event => {
	let world = event.getLevel()

	if(world.side !== "SERVER") {
		return
	}

	let item = event.getItem()

	if (item.id === COMPASS_ITEM_ID) {
		let player = event.getPlayer()
		if (!event.server.persistentData.steal_block_owner) {
			player.tell('UNINITIALIZED')
			return
		}
		 else if (!event.server.persistentData.steal_block_placed) { // Exists or false
			player.tell(`The Soul of Blessings has not been placed by ${event.server.persistentData.steal_block_owner}`)
			return
		}
		else if (event.server.persistentData.steal_block_shared) {
			player.tell('The Soul of Blessings rests peacefully at the spawn, giving blessings to all')
			player.damageHeldItem(event.hand, 1)
			return
		} else if (event.server.persistentData.steal_block_placed && player.level.dimension !== event.server.persistentData.steal_block_location.dimension) {
			player.tell('The Soul of Blessings rests in another dimension...')
			player.damageHeldItem(event.hand, 1)
			return
		} else {
			let loc = event.server.persistentData.steal_block_location
			let dx = loc.x - player.x
			let dy = loc.y - player.y
			let dz = loc.z - player.z
			let dist = Math.round(Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2) + Math.pow(dz,2)))
			player.tell(`${event.server.persistentData.steal_block_owner}'s Soul of Blessings is hidden ${dist} blocks away`)
			player.damageHeldItem(event.hand, 10)
			return
		}
	}
})



onEvent('server.load', function(event) {
	event.server.scheduleInTicks(BUFF_APPLY_RATE_MINS* 60 * 20, function(callback) { // X mins * 60 seconds * 20 tps
		let allPlayers = callback.server.players
		if (allPlayers.length == 0) {
			console.info('No players online')
			callback.reschedule()
			return
		}
		// Privately placed by a player
		if (callback.server.persistentData.steal_block_placed && !callback.server.persistentData.steal_block_shared) {
			let leaderData = getPlayerLeaderBoardStats(callback.server.persistentData.steal_block_owner, callback.server)
			let otherPlayers = getOtherOnlinePlayers(callback.server.persistentData.steal_block_owner, callback.server)
			if (otherPlayers.length > 0) {
				// Other players are online, they get minutes held stat
				leaderData.minutes_held += BUFF_APPLY_RATE_MINS
			}

			if (otherPlayers.length > 0 && isPlayerOnline(callback.server.persistentData.steal_block_owner, callback.server)) {
				// Target player is online with other players, they get buffs and & buffs received stats
				let scumbag = isPlayerOnline(callback.server.persistentData.steal_block_owner, callback.server)
				scumbag.tell('Receiving blessings from the Soul of Blessings')
				for (let i = 0; i < otherPlayers.length; i++) {
					otherPlayers[i].tell(`${callback.server.persistentData.steal_block_owner} is receiving buffs from their desecration of the Soul of Blessings`)
					applyPotionBuff(scumbag, callback.server)
					leaderData.buffs_received++
				}
			}
			updateLeaderBoardStats(callback.server.persistentData.steal_block_owner, callback.server, leaderData)
			callback.reschedule()
			return
		// Placed at the spawn
		} else if (callback.server.persistentData.steal_block_placed && callback.server.persistentData.steal_block_shared) {
			callback.server.tell('By the grace of the shared Soul of Blessings, each player will receive a blessing')
			allPlayers.forEach(p => {
				applyPotionBuff(p, callback.server)
			})
			callback.reschedule()
			return
		}
		callback.reschedule()
		return
	})
})



onEvent('player.chat', function (event) {
    if (!event.message.startsWith(COMMAND_PREFIX) || event.level.side !== "SERVER") {
  		return
  	}

  	let message = event.message

  	if(message.startsWith(COMMAND_PREFIX + LEADERBOARD_COMMAND)) {
  		if (!event.server.persistentData || !event.server.persistentData.capture_leaderboard) {
			console.info('Uh oh! No leaderboard data found')
			event.player.tell('No leaderboard data found')
			event.cancel()
			return
		}
		players = event.server.persistentData.capture_leaderboard
		let text = Text.of('Soul of Blessings Leaderboard: ').gold()
		event.player.tell(text)
		text = Text.of('PLAYER NAME').append(' | ').append('CAPTURES')
		.append(' | ').append('DEFILEMENTS').append(' | ').append('RETURNS').append(' | ')
		.append('BUFFS RECEIVED').append(' | ').append('MINUTES HELD')
		event.player.tell(text)
		players.forEach(p => {
			text = Text.of(`${p.name}`).append(' | ').append(`${p.captures}`)
			.append(' | ').append(`${p.public_captures}`).append(' | ').append(`${p.returns}`)
			.append(' | ').append(`${p.buffs_received}`).append(' | ').append(`${p.minutes_held}`)
			event.player.tell(text)
		})
		event.cancel()
		return
  	}
})