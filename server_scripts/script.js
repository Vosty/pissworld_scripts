// priority: 0

settings.logAddedRecipes = true
settings.logRemovedRecipes = true
settings.logSkippedRecipes = false
settings.logErroringRecipes = true

console.info('Hello, World! (You will see this line every time server resources reload)')

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
	event.shapeled()

})

onEvent('item.tags', event => {
	// Get the #forge:cobblestone tag collection and add Diamond Ore to it
	// event.get('forge:cobblestone').add('minecraft:diamond_ore')

	// Get the #forge:cobblestone tag collection and remove Mossy Cobblestone from it
	// event.get('forge:cobblestone').remove('minecraft:mossy_cobblestone')
})