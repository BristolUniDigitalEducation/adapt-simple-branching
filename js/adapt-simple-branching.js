define([
    'coreJS/adapt',
    'coreViews/blockView',
    'coreModels/blockModel',
    './adapt-simple-branchingBlockView',
    './adapt-simple-branchingBlockModel'
], function (Adapt, CoreBlockView, CoreBlockModel, BlockView, BlockModel) {

    var BRANCHING_ID = "_branching";

    var BlockViewInitialize = CoreBlockView.prototype.initialize;
    CoreBlockView.prototype.initialize = function (options) {
        if (this.model.get(BRANCHING_ID)) {
            //extend
            _.extend(this, BlockView);
        }
        //initialize the block in the normal manner
        return BlockViewInitialize.apply(this, arguments);
    };

    var BlockModelInitialize = CoreBlockModel.prototype.initialize;
    CoreBlockModel.prototype.initialize = function (options) {
        if (this.get(BRANCHING_ID)) {
            //extend
            _.extend(this, BlockModel);
        }
        return BlockModelInitialize.apply(this, arguments);
    };
});
