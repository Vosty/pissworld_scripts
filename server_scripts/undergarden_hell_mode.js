const GROWTH_FACTOR_GENERIC = 2.0
const GROWTH_FACTOR_HP = 3.0

const FOLLOW_RANGE = 64.0

const GENERIC_TRAITS = [
'minecraft:generic.attack_damage',
'minecraft:generic.movement_speed',
//'minecraft:generic.knockback_resistance',
'minecraft:generic.attack_damage',
'minecraft:generic.armor',
'minecraft:generic.armor_toughness',
'minecraft:generic.attack_knockback'
]



onEvent('entity.spawned', function(event) {
	if(event.level.side !== "SERVER") {
		return
  	}

  	if (event.entity.type.startsWith == 'undergarden' || event.entity.level.dimension == 'undergarden:the_undergarden') {
  		let mob = event.entity
  		let NBT = mob.fullNBT
  		
        
        // Modify all target attributes
        NBT.Attributes.forEach(attribute => {
        	if (GENERIC_TRAITS.includes(attribute.Name)) {
        		attribute.Base *= GROWTH_FACTOR_GENERIC;
        	}
        	if(attribute.Name.equals('minecraft:generic.follow_range')) {
        		attribute.Base = FOLLOW_RANGE
        	}
    	})

        // Set the entity's NBT to our new NBT.
        mob.fullNBT = NBT;

        // Now that the NBT is set, we can safely set max health and current health.
        mob.maxHealth *= GROWTH_FACTOR_HP
        mob.health    *= GROWTH_FACTOR_HP
    }
})