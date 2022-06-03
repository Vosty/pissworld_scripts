const STEAL_BLOCK_ID = 'kubejs:tingy'


function createPlayerLeaderBoardStats(player) {
	let data = {name: player}
	data.captures = 0
	data.returns = 0
	data.buffs_received = 0
	data.minutes_held = 0
}

function getPlayerLeaderBoardStats(player, server) {
	if (!server.persistentData.capture_leaderboard) {
		server.persistentData.capture_leaderboard = NBT.ListTag()
	}
	let target = null
		server.persistentData.capture_leaderboard.forEach(entry => {
		if (player === entry.name) {
			target = entry
		}
	})
	if (!target) {
		target = createPlayerLeaderBoardStats(player)
		server.persistentData.capture_leaderboard.add(target)
	}
	return target
}


function updateLeaderBoardStats(player, server, data) {
	let i
	for (i = 0; i < server.persistentData.capture_leaderboard.length; i++) {
		if (server.persistentData.capture_leaderboard.get(i).name == player) {
			server.persistentData.capture_leaderboard.remove(i)
			server.persistentData.capture_leaderboard.add(i, data)
		}
	}
}





onEvent('block.place', function (event) {
	let world = event.level

	if (world.side !== "SERVER") {
		return
	}

	if (event.block.id === STEAL_BLOCK_ID) {
		let player = event.player
		event.server.persistentData.steal_block_owner = player.toString()
		event.server.persistentData.steal_block_placed = true
		let steal_block_location = NBT.compoundTag()
		steal_block_location.x = event.block.x
		steal_block_location.y = event.block.y
		steal_block_location.z = event.block.z
		steal.block.location.dimension = world.dimension
		event.server.steal_block_location = steal_block_location
		event.server.tell(`${player} has placed the SUPER CUBE!`)
		(if)
	}
})






onEvent('block.break', function (event) {
	let world = event.level

	if (world.side !== "SERVER") {
		return
	}

	if (event.block.id === STEAL_BLOCK_ID) {
		let player = event.player
		event.server.tell(`${player} has broken the SUPER CUBE!`)
		event.server.persistentData.steal_block_placed = false
		let playerData = getPlayerLeaderBoardStats(player.toString(), server)
		playerData.captures++

	}
})






onEvent('server.load', function(event) {
	event.server.scheduleInTicks(BOUNTY_HUNT_TIME_IN_TICKS, function(callback) {
		let allPlayers = callback.server.players
		if (allPlayers.length == 0) {
			callback.server.tell('No players online')
			callback.reschedule()
			return
		}
		let rand = Math.round(Math.random() * (allPlayers.length-1))
		console.info(rand)
		let bountyPlayer = allPlayers[rand]
		callback.server.tell(`${bountyPlayer} is now the bounty target!`)
		let rewardPoints = BOUNTY_REWARD_BASE
		if (bountyPlayer.persistentData.red_kill_score) {
				rewardPoints += Math.round(Math.sqrt(bountyPlayer.persistentData.red_kill_score))
		}
		callback.server.tell(`${bountyPlayer} is at ${bountyPlayer.x} ${bountyPlayer.y} ${bountyPlayer.z} in ${bountyPlayer.level.dimension}`)
		callback.server.tell(`The reward is ${rewardPoints} medals!`)
		bountyTarget = bountyPlayer.name
		bountyScore = rewardPoints
		callback.reschedule()
	})
})