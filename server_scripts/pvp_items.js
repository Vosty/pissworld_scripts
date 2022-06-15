const DISPEL_RADIUS = 10.0
const DISPEL_COOLDOWN_SECONDS = 15.0

const RAGE_GEM_SACRIFICE_DMG = 10.0
const RAGE_GEM_BUFFS = 4
const RAGE_GEM_COOLDOWN_SECONDS = 60.0

const SELF_DESTRUCT_EXPLOSION_STRENGTH = 10.0

const SWAPPER_DISTANCE = 50.0
const SWAPPER_COOLDOWN_SECONDS = 1.0

const ABDUCTOR_COOLDOWN_SECONDS = 600.0
const ABDUCTOR_RADIUS = 30.0
const MAX_Y = 320.0
const WORLD_BORDER = 3500.0



function applyRageGemBuff(player, server) {
	// Uses data from capture_block.js
	let rand = Math.round(Math.random() * (POTIONS_BUFFS.length-1))
	let buff = POTIONS_BUFFS[rand]
	let seconds = RAGE_GEM_COOLDOWN_SECONDS
	console.info(`Giving ${player} buff ${buff.name} for ${seconds} seconds`)
	server.runCommandSilent(`/effect give ${player} ${buff.name} ${seconds} ${buff.amp}`)
	player.tell(buff.tip)
}


onEvent('item.right_click', event => {
	let world = event.level

	if(world.side !== "SERVER") {
		return
	}

	let item = event.item

	if (item.id === 'kubejs:dispel_amulet') {
		let player = event.player
		player.addItemCooldown('kubejs:dispel_amulet', 20 * DISPEL_COOLDOWN_SECONDS )
		let x = player.x
		let y = player.y
		let z = player.z
		let effected = world.getEntitiesWithin(AABB.of(x - DISPEL_RADIUS, y - DISPEL_RADIUS, z - DISPEL_RADIUS, x + DISPEL_RADIUS, y + DISPEL_RADIUS, z + DISPEL_RADIUS))
		for (let e of effected) {
			if (e.isPlayer()) {
				e.getPotionEffects().clear()
				e.runCommandSilent(`/playsound minecraft:block.amethyst_cluster.break master ${e}`)
			}
		}
		player.damageHeldItem(event.hand, 10)
		return
	}


	if (item.id === 'kubejs:rage_gem') {
		let player = event.player
		player.addItemCooldown('kubejs:rage_gem', 20 * RAGE_GEM_COOLDOWN_SECONDS )
		player.attack(RAGE_GEM_SACRIFICE_DMG)
		for (let i = 0; i < RAGE_GEM_BUFFS; i++) {
			applyRageGemBuff(player, event.server)
			console.log('RAGE')
		}
		player.damageHeldItem(event.hand, 10)
		return
	}

	if (item.id === 'kubejs:self_destruct_bomb') {
		let player = event.player
		world.spawnLightning(player.x,player.y,player.z, true, player)
		let explosion = world.createExplosion(player.x,player.y,player.z)
		//explosion.causesFire(true)
		//explosion.exploder(player)
		explosion.strength = SELF_DESTRUCT_EXPLOSION_STRENGTH
		explosion.explode()
		if (event.hand == MAIN_HAND) {
			player.getMainHandItem().count--
		} else {
			player.getOffHandItem().count--
		}
		player.kill() // Perhaps this should be attack, and it wrecks their armor
		return
	}


	/*if (item.id === 'kubejs:position_swapper') {
		let player = event.player
		let raytraceResult = player.rayTrace(SWAPPER_DISTANCE)
		console.info(raytraceResult.entity)
		console.info(raytraceResult.block)
		if (raytraceResult.block) {
			world.entities.getE
			player.addItemCooldown('kubejs:position_swapper', 20 * SWAPPER_COOLDOWN_SECONDS )
			let e = raytraceResult.entity
			let x = player.x
			let y = player.y
			let z = player.z
			let yaw = player.yaw
			let pitch = player.pitch

			player.setPositionAndRotation(e.x,e.y,e.z,e.yaw,e.pitch)
			e.setPositionAndRotation(x,y,z,yaw,pitch)

			player.damageHeldItem(event.hand, 1)
		}
		return
	}*/


	if (item.id === 'kubejs:abductor') {
		let player = event.player

		let x = player.x
		let y = player.y
		let z = player.z
		let effected = world.getEntitiesWithin(AABB.of(x - ABDUCTOR_RADIUS, y - ABDUCTOR_RADIUS, z - ABDUCTOR_RADIUS, x + ABDUCTOR_RADIUS, y + ABDUCTOR_RADIUS, z + ABDUCTOR_RADIUS))
		let players = []
		effected.forEach(e => {
			if (e.isPlayer()) {
				players.push(e)
			}
		})
		if (players.length < 2) {
			player.tell('No nearby players!')
			return
		}
		//player.addItemCooldown('kubejs:abductor', 20 * ABDUCTOR_COOLDOWN_SECONDS )
		let dropX = (Math.random() * WORLD_BORDER * 2.0) - WORLD_BORDER
		let dropZ = (Math.random() * WORLD_BORDER * 2.0) - WORLD_BORDER
		players.forEach(p => {
			//Keep players at original distance from each other
			let xOffset = x - p.x + dropX
			let zOffset = z - p.z + dropZ
			// Fall from the top of the world PUBG style
			console.info(p)
			event.server.runCommandSilent(`/execute in minecraft:overworld run tp ${p} ${xOffset} ${MAX_Y} ${dropZ}`)
			event.server.runCommandSilent(`/effect give ${p} minecraft:slow_falling 90`) //is 90 enough / too much?
			p.runCommandSilent(`/playsound minecraft:block.bell.resonate master ${p}`)
		})
		player.damageHeldItem(event.hand, 10)
		return
	}
})