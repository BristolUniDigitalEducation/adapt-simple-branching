define([
    'coreJS/adapt',
    'coreViews/blockView'
], function (Adapt, CoreBlockView) {
    var SimpleBranchingView = {
        postRender: function () {
            //console.log("SimpleBranchingView"+":"+this.model.get("_id"), "postRender");
            CoreBlockView.prototype.postRender.call(this);
            if (this.model.isBranchingEnabled()) {
                this.hideComponents();
                if (this.model.isQuestionComplete()) {
                    //display appriopriate component
                    this.showComponent();
                } else {
                    //listen to finish of question
                    this.listenTo(Adapt, "remove", this.onRemove);
                    this.listenTo(this.model.getQuestionModel(), "change:_isInteractionComplete", this.onQuestionComplete);
                }
            }
        },
        hideComponents: function () {
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "hideComponents");
            //
            var descendantComponents = this.model.findDescendants('components');
            if (descendantComponents.length > 0) {
                descendantComponents.each(_.bind(function (model) {
                    model.set("_isAvailable", false);
                    model.set("_isVisible", false);
                    try {
                        this.$("." + model.get("_id")).addClass("display-none");
                    } catch (e) {
                        console.error(e);
                    }
                }), this);
            }
            //
            this.model.set("_isVisible", false);
            this.$el.addClass("display-none");
            //
            Adapt.trigger("pageLevelProgress:update");
        },
        showComponent: function () {
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "showComponent");
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), this.model);
            var models,
                correct = this.model.getCorrectModel(),
                incorrect = this.model.getIncorrectModel(),
                forceCompletion = this.model.isForceCompletion();
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "forceCompletion", forceCompletion);
            if (forceCompletion) {
                if (correct) this._setCompletionOnModel(correct, true);
                if (incorrect) this._setCompletionOnModel(incorrect, true);
            } else {
                //force completion of "hidden" child
                if (!this.model.isQuestionCorrect()) {
                    if (correct) this._setCompletionOnModel(correct, true);
                } else {
                    if (incorrect) this._setCompletionOnModel(incorrect, true);
                }
            }

            if (this.model.isQuestionCorrect()) {
                //show 'correct' component
                models = correct;
            } else {
                //show 'incorrect' component
                models = incorrect;
            }
            //disable hidden children
            if (!this.model.isQuestionCorrect()) {
                if (correct) this._disableModel(correct);
            } else {
                if (incorrect) this._disableModel(incorrect);
            }
            //
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "models", models);
            //
            if (models && models.length > 0) {

                for (var i = 0, max = models.length; i < max; i++) {
                    var m = models[i];
                    m.set("_isVisible", true);
                    this.$("." + m.get("_id")).removeClass("display-none");
                    m.set("_isAvailable", true);
                }
				// moved this inside condition or block titles will
				// show for blocks with no components
				this.model.set("_isVisible", true);
				this.$el.removeClass("display-none");
            }
            //
            if (forceCompletion) {
                this.model.setCompletionStatus();
            }
            //
            Adapt.trigger("pageLevelProgress:update");
            //
            $(window).resize();
        },
        _setCompletionOnModel: function (models, status) {
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "_setCompletionOnModel(models, status)", models, status);
            if (models && models.length > 0) {
                for (var i = 0, max = models.length; i < max; i++) {
                    var model = models[i];
                    model.set({
                        "_isVisible": status,
                        "_isComplete": status,
                        "_isInteractionComplete": status
                    });
                }
            }
        },
        _disableModel: function (models) {
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "_disableModel(models)", models);
            if (models && models.length > 0) {
                for (var i = 0, max = models.length; i < max; i++) {
                    var model = models[i];
                    model.set({
                        "_isEnabled": false,
                        "_navButtons": {
                            "_isEnabled": false
                        }
                    });
                }
            }
        },
        onQuestionComplete: function (model, value, isPerformingCompletionQueue) {
           //console.log("SimpleBranchingView" + ":" + this.model.get("_id"), "onQuestionComplete", arguments);
            if (value) {
                this.showComponent();
            }
        },
        onRemove: function () {
            this.stopListening(this.model.getQuestionModel(), "change:_isInteractionComplete", this.onQuestionComplete);
            this.stopListening(Adapt, "remove", this.onRemove);
        }
    };

    return SimpleBranchingView;
});
