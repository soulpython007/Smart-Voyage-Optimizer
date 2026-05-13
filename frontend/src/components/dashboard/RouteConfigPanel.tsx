import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Dropdown, Button, Slider, SidebarSection, RouteCard, LayerToggle } from '../ui';
import { MODE_PROFILES, type OptimizationMode } from '../../types/maritime';

export function RouteConfigPanel() {
  const {
    settings, ports, routes, selectedRouteIndex, showCurrents, showWeather,
    updateSettings, updateWeights, selectRoute, optimize, isOptimizing,
    setShowCurrents, setShowWeather,
  } = useStore();

  const [localWeights, setLocalWeights] = useState(settings.weights);

  useEffect(() => {
    if (settings.mode !== 'custom') {
      const profile = MODE_PROFILES[settings.mode];
      const newWeights = { fuel: profile.fuel, time: profile.time, safety: profile.safety };
      setLocalWeights(newWeights);
      updateWeights(newWeights);
    }
  }, [settings.mode]);

  const portOptions = useMemo(() => {
    return (ports?.features ?? [])
      .map((f) => {
        const p = f.properties as Record<string, unknown>;
        return { value: p.id as string, label: p.name as string };
      })
      .filter((p) => p.value && p.label);
  }, [ports]);

  useEffect(() => {
    if (portOptions.length > 0 && !settings.departure) {
      const sg = portOptions.find((p) => p.value === 'sg-sin');
      const mum = portOptions.find((p) => p.value === 'in-mum');
      if (sg) updateSettings({ departure: sg.value });
      if (mum) updateSettings({ destination: mum.value });
    }
  }, [portOptions, settings.departure]);

  const handleModeChange = (mode: string) => {
    updateSettings({ mode: mode as OptimizationMode });
  };

  const handleWeightChange = (key: 'fuel' | 'time' | 'safety', value: number) => {
    const newWeights = { ...localWeights, [key]: value };
    setLocalWeights(newWeights);
    updateWeights(newWeights);
    updateSettings({ mode: 'custom' });
  };

  const modeOptions: { value: string; label: string }[] = [
    { value: 'eco', label: 'Eco' },
    { value: 'fast', label: 'Fast' },
    { value: 'safe', label: 'Safe' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-1">
      <SidebarSection title="Route Configuration">
        <Dropdown
          label="Departure Port"
          value={settings.departure}
          options={portOptions}
          onChange={(v) => updateSettings({ departure: v })}
          placeholder="Select departure..."
        />
        <Dropdown
          label="Destination Port"
          value={settings.destination}
          options={portOptions}
          onChange={(v) => updateSettings({ destination: v })}
          placeholder="Select destination..."
        />
        <Dropdown
          label="Optimization Mode"
          value={settings.mode}
          options={modeOptions}
          onChange={handleModeChange}
        />
        <Button
          className="w-full mt-2"
          size="lg"
          onClick={optimize}
          loading={isOptimizing}
        >
          Optimize Route
        </Button>
      </SidebarSection>

      {settings.mode === 'custom' && (
        <SidebarSection title="Weight Tuning">
          <Slider
            label="Fuel Efficiency"
            value={localWeights.fuel}
            onChange={(v) => handleWeightChange('fuel', v)}
            unit="%"
          />
          <Slider
            label="Time Priority"
            value={localWeights.time}
            onChange={(v) => handleWeightChange('time', v)}
            unit="%"
          />
          <Slider
            label="Safety Margin"
            value={localWeights.safety}
            onChange={(v) => handleWeightChange('safety', v)}
            unit="%"
          />
        </SidebarSection>
      )}

      <SidebarSection title="Map Layers">
        <LayerToggle
          label="Weather Zones"
          enabled={showWeather}
          onChange={setShowWeather}
          color="#eab308"
        />
        <LayerToggle
          label="Ocean Currents"
          enabled={showCurrents}
          onChange={setShowCurrents}
          color="#3b82f6"
        />
      </SidebarSection>

      {routes.length > 0 && (
        <SidebarSection title="Routes">
          <div className="space-y-2">
            {routes.map((route, i) => (
              <RouteCard
                key={route.mode}
                route={route}
                isSelected={selectedRouteIndex === i}
                onSelect={() => selectRoute(i)}
              />
            ))}
          </div>
        </SidebarSection>
      )}
    </div>
  );
}
