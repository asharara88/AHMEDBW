tric.trend === 'down' ? '-' : ''}
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-text-light">Score</span>
                      <span className="font-medium">{metric.value}/100</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                      <div 
                        className={`h-full ${
                          metric.value >= 80 ? 'bg-success' : 
                          metric.value >= 70 ? 'bg-primary' : 
                          metric.value >= 60 ? 'bg-warning' : 
                          'bg-error'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {/* Activity Score (Expandable) */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Activity Score</span>
                    <div className="flex items-center">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success">+7</span>
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-text-light">Score</span>
                    <span className="font-medium">85/100</span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                    <div className="h-full bg-success" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Today's Activities</h4>
                    {activityData.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                        <span>{activity.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-text-light">{activity.duration}</span>
                          <span>{activity.calories} cal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Movement Score */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Movement Score</span>
                    <div className="flex items-center">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-success" />
                      <span className="text-xs text-success">+5</span>
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-text-light">Score</span>
                    <span className="font-medium">78/100</span>
                  </div>
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--color-surface-2))]">
                    <div className="h-full bg-primary" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Active Calories</div>
                      <div className="font-medium">{movementData.activeCalories} cal</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Total Calories</div>
                      <div className="font-medium">{movementData.totalCalories} cal</div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-3">
                  <h4 className="mb-3 text-xs font-medium">Additional Metrics</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Stand Hours</div>
                      <div className="font-medium">{movementData.standHours}/12</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Daily Steps</div>
                      <div className="font-medium">{movementData.steps}</div>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--color-card))] p-2 text-xs">
                      <div className="text-text-light">Non-Exercise</div>
                      <div className="font-medium">{movementData.nonExerciseActivity}</div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-center text-xs text-text-light">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BWScoreCard;