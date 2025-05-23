import CalendarSelectorComponent from "../selector/calendar";
import BasicSelectorComponent from "../selector/basic";
import { useState, useEffect } from "react";
import { DeviceController } from "../../controllers/device";
import { LocationController } from "../../controllers/location";
import { OdnController } from "../../controllers/odn";
import { Strings } from "../../constant/strings";
import { LoadStatus } from "../../constant/loadStatus";
import type { FilterOptionSchema } from "../../schemas/filter";
import type { DeviceSchema } from "../../schemas/device";
import type { LoadingStateValue } from "../../types/loadingState";
import React from "react";

/**
 * @interface Data required for the traffic filter.
 * 
 * @param {LoadingStateValue} loading Loading state of the filter component.
 * @param {(filters: FilterOptionSchema) => void} onClick Callback to handle the click on a filter.
 * @param {(option: string) => void} onClickOptionFilter Callback to handle the click on a filter option.
 */
interface FilterProps {
    loading: LoadingStateValue;
    onClick: (filters: FilterOptionSchema) => void;
    onClickOptionFilter?: (option: string) => void;
}

export default function TrafficFilterComponent(content: FilterProps) {
    // OPTIONS (BUTTONS)
    const [optionFilter, setOptionFilter] = useState<string>(Strings.EQUIPMENT);
    const [filterAvailable, setFilterAvailable] = useState<boolean>(false);

    // DATA COLLECTED (FILTER OPTIONS)
    const [odns, setOdns] = useState<string[]>([]);
    const [acronyms, setAcronyms] = useState<string[]>([]);
    const [cards, setCards] = useState<number[]>([]);
    const [ports, setPorts] = useState<number[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [counties, setCounties] = useState<string[]>([]);
    const [municipalities, setMunicipalities] = useState<string[]>([]);

    // DATA SELECTED (FILTER SELECTION)
    const [fromDate, setFromDate] = useState<string>();
    const [toDate, setToDate] = useState<string>();
    const [odn, setOdn] = useState<string>();
    const [acronym, setAcronym] = useState<DeviceSchema>();
    const [state, setState] = useState<string>();
    const [county, setCounty] = useState<string>();
    const [municipality, setMunicipality] = useState<string>();
    const [card, setCard] = useState<number>();
    const [port, setPort] = useState<number>();


    /**
     * Handle to perform a search with the selected filters.
     */
    const handlerSearchFilter = async () => {
        if (filterAvailable && content.loading !== LoadStatus.LOADING) {
            let filter: FilterOptionSchema = {
                optionFilter: optionFilter,
                fromDate: fromDate,
                toDate: toDate,
                device: acronym,
                card: card,
                port: port,
                state: state,
                county: county,
                municipality: municipality,
                odn: odn
            }
            content.onClick(filter);
        }
    };


    /**
     * Handler to get the selected option filter.
     * 
     * @param {string} newOption Option filter selected.
     */
    const handlerOptionFilterChange = (newOption: string) => {
        setOptionFilter(newOption);
        if (content.onClickOptionFilter) content.onClickOptionFilter(newOption);
    };


    /**
     * Handler to get the selected from date.
     * 
     * @param {string} newDate From date selected.
     */
    const handlerFromDateChange = (newDate: string) => {
        setFromDate(newDate);
    };


    /**
     * Handler to get the selected to date.
     * 
     * @param {string} newDate To date selected.
     */
    const handlerToDateChange = (newDate: string) => {
        setToDate(newDate);
    };


    /**
     * Handler to get the selected state.
     * 
     * @param {string} newState State selected.
     */
    const handlerStateChange = async (newState: string) => {
        setMunicipalities([]);
        setCounties([]);
        if (newState === Strings.EMPTYSELECTION) setState(undefined);
        else {
            setState(newState);
            let currentCounties = await LocationController.getCounties(newState);
            setCounties(currentCounties);
        }
    };


    /**
     * Handler to get the selected county.
     * 
     * @param {string} newCounty County selected.
     */
    const handlerCountyChange = async (newCounty: string) => {
        if (newCounty === Strings.EMPTYSELECTION) {
            setCounty(undefined);
            setMunicipalities([]);
        } else {
            setCounty(newCounty);
            if (state) {
                let currentMunicipalities = await LocationController.getMunicipalities(state, newCounty);
                setMunicipalities(currentMunicipalities);   
            }
        }
    };


    /**
     * Handler to get the selected municipality.
     * 
     * @param {string} newMunicipality Municipality selected.
     */
    const handlerMunicipalityChange = (newMunicipality: string) => {
        if (newMunicipality === Strings.EMPTYSELECTION) setMunicipality(undefined);
        else setMunicipality(newMunicipality);
    };


    /**
     * Handler to get the selected acronym.
     * 
     * @param {string} newAcronym Acronym selected.
     */
    const handlerAcronymChange = async (newAcronym: string) => {
        setCards([]);
        setPorts([]);
        setOdns([]);
        if (newAcronym === Strings.EMPTYSELECTION) setAcronym(undefined);
        else {
            let currentDevice = await DeviceController.getDeviceBySysname(newAcronym);
            if (optionFilter === Strings.EQUIPMENT) {
                if (currentDevice) {
                    setAcronym(currentDevice)
                    let currentCards = await DeviceController.getAllCardNumbers(currentDevice.id);
                    setCards(currentCards);
                } else setCards([]);
            } else if (optionFilter === Strings.ODN) {
                if (currentDevice) {
                    setAcronym(currentDevice)
                    let currentODNs = await OdnController.getOdnByDevice(currentDevice.id);
                    setOdns(currentODNs);
                } else setOdns([]);
            }
        }
    };


    /**
     * Handler to get the selected ODN.
     * 
     * @param {string} newOdn ODN selected.
     */
    const handlerOdnChange = async (newOdn: string) => {
        if (newOdn === Strings.EMPTYSELECTION) setOdn(undefined);
        else setOdn(newOdn);
    };


    /**
     * Handler to get the selected card.
     * 
     * @param {number} newCard Card selected.
     */
    const handlerCardChange = async (newCard: number) => {
        if (newCard.toString() === Strings.EMPTYSELECTION) {
            setCard(undefined);
            setPorts([]);
        }
        else {
            setCard(newCard);
            if (newCard && acronym)  {
                let currentPorts = await DeviceController.getAllPortNumbers(acronym.id, newCard);
                setPorts(currentPorts);
            }
        }
    };


    /**
     * Handler to get the selected port.
     * 
     * @param {number} newPort Port selected.
     */
    const handlerPortChange = (newPort: number) => {
        if (newPort.toString() === Strings.EMPTYSELECTION) setPort(undefined);
        else setPort(newPort);
    };

    useEffect(() => {
        if (fromDate === "NaN-NaN-NaN") setFromDate(undefined);
        if (toDate === "NaN-NaN-NaN") setToDate(undefined);
        if (fromDate && toDate) {
            if (optionFilter === Strings.EQUIPMENT) {
                if (acronym && !card && !port) setFilterAvailable(true);
                else if (!port) setFilterAvailable(false);
                else if (acronym && card && port) setFilterAvailable(true);
            } else if (optionFilter === Strings.ODN) {
                if (!odn) setFilterAvailable(false);
                else if (acronym && odn) setFilterAvailable(true);
            } else if (optionFilter === Strings.LOCATION) {
                if (!state && !county && !municipality) setFilterAvailable(false);
                else setFilterAvailable(true);
            }
        } else setFilterAvailable(false);
    }, [fromDate, toDate, acronym, card, port, state, county, municipality, odn]);
    
    useEffect(() => {
        const getDevices = async () => {
            const devices = await DeviceController.getAllAcronyms();
            setAcronyms(devices);
        }
        const getStates = async () => {
            const states = await LocationController.getStates();
            setStates(states);
        }
        getDevices();
        getStates();
    }, []);

    return (
        <div className="min-w-fit w-full h-2/3 max-h-fit p-6 bg-white flex flex-col items-center justify-center gap-4 self-center rounded-xl lg:self-start md:w-fit max-sm:w-full max-sm:gap-3">
            <h3 className="text-2xl text-blue-800 text-center font-bold lg:self-start">Búsqueda por</h3>
            <section className="w-full flex flex-row justify-center items-center lg:justify-start gap-3">
                <button type="button" onClick={() => handlerOptionFilterChange(Strings.EQUIPMENT)} className={`w-fit h-fit px-6 py-1 ${optionFilter === Strings.EQUIPMENT ? "bg-blue-600" : "bg-blue-900"} text-white font-bold rounded-full transition-all duration-300 ease-linear ${optionFilter === Strings.EQUIPMENT ? "" : "hover:bg-blue-500"}`}>Equipo</button>
                <button type="button" onClick={() => handlerOptionFilterChange(Strings.ODN)} className={`w-fit h-fit px-6 py-1 ${optionFilter === Strings.ODN ? "bg-blue-600" : "bg-blue-900"} text-white font-bold rounded-full transition-all duration-300 ease-linear ${optionFilter === Strings.ODN ? "" : "hover:bg-blue-500"}`}>ODN</button>
                <button type="button" onClick={() => handlerOptionFilterChange(Strings.LOCATION)} className={`w-fit h-fit px-6 py-1 ${optionFilter === Strings.LOCATION ? "bg-blue-600" : "bg-blue-900"} text-white font-bold rounded-full transition-all duration-300 ease-linear ${optionFilter === Strings.LOCATION ? "" : "hover:bg-blue-500"}`}>Ubicación</button>
            </section>
            <section className="w-full flex flex-col justify-start gap-3">
                <div className="w-full flex flex-row gap-3 flex-wrap lg:flex-nowrap max-sm:flex-col max-sm:gap-3">
                    <CalendarSelectorComponent id="fromDate" label="Desde" onChange={handlerFromDateChange} />
                    <CalendarSelectorComponent id="toDate" label="Hasta" onChange={handlerToDateChange} />
                </div>
            </section>
            {optionFilter === Strings.EQUIPMENT && <section className="w-full flex flex-col justify-start gap-3">
                <BasicSelectorComponent id="olt" label="OLT" options={acronyms} onChange={handlerAcronymChange} />
                <div className="w-full flex flex-row gap-3 flex-wrap lg:flex-nowrap">
                    <BasicSelectorComponent id="card" label="Tarjeta" options={cards} onChange={handlerCardChange} />
                    <BasicSelectorComponent id="port" label="Puerto" options={ports} onChange={handlerPortChange} />
                </div>
            </section>}
            {optionFilter === Strings.ODN && <section className="w-full flex flex-col justify-start gap-3">
                <BasicSelectorComponent id="olt" label="OLT" options={acronyms} onChange={handlerAcronymChange} />
                <BasicSelectorComponent id="odn" label="ODN" options={odns} onChange={handlerOdnChange} />
            </section>}
            {optionFilter === Strings.LOCATION && <section className="w-full flex flex-col justify-start gap-3">
                <BasicSelectorComponent id="state" label="Estado" options={states} onChange={handlerStateChange} />
                <BasicSelectorComponent id="county" label="Municipio" options={counties} onChange={handlerCountyChange} />
                <BasicSelectorComponent id="municipality" label="Parroquia" options={municipalities} onChange={handlerMunicipalityChange} />
            </section>}
            <button type="button" id="filterButton" onClick={handlerSearchFilter} className={`w-fit h-fit px-8 py-2 ${(filterAvailable && content.loading !== LoadStatus.LOADING) ? "bg-blue-700" : "bg-gray-300"} text-white font-bold rounded-full transition-all duration-300 ease-linear ${(filterAvailable && content.loading !== LoadStatus.LOADING) ? "hover:bg-blue-900" : ""}`}> Filtrar </button>
        </div>
    );
}